import Web3 from 'web3'
import memoize from 'lodash/memoize'
import { BigNumber } from 'ethers'
import { Currency, CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core'

import { getSimpleStakingContractAddresses, simpleStakingContract } from './contracts/SimpleStakingContract'
import { goodFundManagerContract } from './contracts/GoodFundManagerContract'
import { goodMarketMakerContract } from './contracts/GoodMarketMakerContract'
import { getToken, getTokenByAddress } from './methods/tokenLists'
import { getAccount, getChainId } from './utils/web3'
import { aaveStaking, g$Price } from './apollo'
import { compoundStaking } from './rest'
import { LIQUIDITY_PROTOCOL } from './constants/protocols'
import { debug, DEBUG_ENABLED, debugGroup, debugGroupEnd } from './utils/debug'
import { stakersDistributionContract } from './contracts/StakersDistributionContract'
import { CDAI, G$, GDAO, USDC } from './constants/tokens'
import { cacheClear } from './utils/memoize'
import { decimalPercentToPercent, decimalToJSBI } from './utils/converter'
import { ERC20Contract } from './contracts/ERC20Contract'
import { compoundPrice } from './methods/compoundPrice'
import { v2TradeExactIn } from './methods/v2TradeExactIn'
import { cDaiPrice } from './methods/cDaiPrice'

export type Stake = {
    APY: Fraction
    address: string
    protocol: LIQUIDITY_PROTOCOL
    liquidity: Fraction
    rewards: { G$: CurrencyAmount<Currency>; GDAO: CurrencyAmount<Currency> }
    socialAPY: Fraction
    tokens: { A: Token; B: Token }
}

type MyReward = { claimed: CurrencyAmount<Currency>; unclaimed: CurrencyAmount<Currency> }

type MyStake = {
    address: string
    protocol: LIQUIDITY_PROTOCOL
    multiplier: boolean
    rewards: {
        reward: MyReward
        reward$: MyReward
        GDAO: MyReward
    }
    stake: { amount: CurrencyAmount<Currency>; amount$: CurrencyAmount<Currency> }
    tokens: { A: Token; B: Token }
}

/**
 * Return list of all stakes.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<Stake[]>}
 */
export async function getList(web3: Web3): Promise<Stake[]> {
    const simpleStakingAddresses = await getSimpleStakingContractAddresses(web3)

    cacheClear(getSocialAPY)
    cacheClear(getTokenPriceInUSDC)
    cacheClear(getReserveRatio)
    cacheClear(getAPY)
    cacheClear(getLiquidity)
    cacheClear(getYearlyRewardGDAO)
    cacheClear(getYearlyRewardG$)

    if (DEBUG_ENABLED) {
        const result = []
        for (const address of simpleStakingAddresses) {
            result.push(await metaStake(web3, address))
        }
        return result
    } else {
        return Promise.all(simpleStakingAddresses.map(address => metaStake(web3, address)))
    }
}

/**
 * Return list of all user's stakes.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<Stake[]>}
 */
export async function getMyList(web3: Web3): Promise<MyStake[]> {
    const simpleStakingAddresses = await getSimpleStakingContractAddresses(web3)

    cacheClear(getTokenPriceInUSDC)

    let stakes: MyStake[] = []

    if (DEBUG_ENABLED) {
        for (const address of simpleStakingAddresses) {
            const stake = await metaMyStake(web3, address)
            if (!stake) {
                continue
            }
            stakes.push(stake)
        }
    } else {
        const stakes = await Promise.all(simpleStakingAddresses.map(address => metaMyStake(web3, address)))
        stakes.push(...(stakes.filter(Boolean) as MyStake[]))
    }

    return stakes
}

/**
 * Returns meta for each stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @returns {Promise<Stake>}
 */
async function metaStake(web3: Web3, address: string): Promise<Stake> {
    debugGroup(`Stake for ${address}`)

    const simpleStaking = simpleStakingContract(web3, address)

    const [tokenAddress, iTokenAddress, protocolName] = await Promise.all([
        simpleStaking.methods.token().call(),
        simpleStaking.methods.iToken().call(),
        simpleStaking.methods.name().call()
    ])

    const [token, iToken] = (await Promise.all([
        getTokenByAddress(web3, tokenAddress),
        getTokenByAddress(web3, iTokenAddress)
    ])) as [Token, Token]

    const protocol = getProtocol(protocolName)

    const [APY, socialAPY, liquidity, rewardG$, rewardGDAO] = await Promise.all([
        getAPY(web3, address, protocol, token),
        getSocialAPY(web3, protocol, token, iToken),
        getLiquidity(web3, address, protocol, token),
        getYearlyRewardG$(web3, address),
        getYearlyRewardGDAO(web3, address)
    ])

    const result = {
        APY,
        address,
        protocol,
        liquidity,
        rewards: { G$: rewardG$, GDAO: rewardGDAO },
        socialAPY,
        tokens: { A: token, B: iToken }
    }

    debug('Result', result)

    debugGroupEnd(`Stake for ${address}`)

    return result
}

/**
 * Returns meta for mine stake with rewards.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @returns {Promise<Stake | null>}
 */
async function metaMyStake(web3: Web3, address: string): Promise<MyStake | null> {
    debugGroup(`My stake for ${address}`)

    const simpleStaking = await simpleStakingContract(web3, address)

    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    const users = await simpleStaking.methods.users(account).call()

    if (!users || parseInt(users.amount.toString()) === 0) {
        debugGroupEnd(`My stake for ${address}`)
        return null
    }

    const [tokenAddress, iTokenAddress, protocolName, threshold] = await Promise.all([
        simpleStaking.methods.token().call(),
        simpleStaking.methods.iToken().call(),
        simpleStaking.methods.name().call(),
        simpleStaking.methods.maxMultiplierThreshold().call()
    ])

    const [token, iToken] = (await Promise.all([
        getTokenByAddress(web3, tokenAddress),
        getTokenByAddress(web3, iTokenAddress)
    ])) as [Token, Token]

    const protocol = getProtocol(protocolName)
    const amount = CurrencyAmount.fromRawAmount(token, users.amount.toString())
    const multiplier = Math.round(Date.now() / 1000) - parseInt(users.multiplierResetTime) > threshold

    const tokenPrice = await getTokenPriceInUSDC(web3, protocol, token)

    let amount$: CurrencyAmount<Currency>
    if (tokenPrice) {
        const _amountUSDC = amount.multiply(tokenPrice).divide(10 ** token.decimals)
        amount$ = CurrencyAmount.fromFractionalAmount(USDC[chainId], _amountUSDC.numerator, _amountUSDC.denominator)
    } else {
        amount$ = CurrencyAmount.fromRawAmount(USDC[chainId], 0)
    }

    debug('Amount', amount.toSignificant(6))
    debug('Amount USDC', amount$.toSignificant(6))

    const [rewardG$, rewardGDAO] = await Promise.all([
        getRewardG$(web3, address, account),
        getRewardGDAO(web3, address, account)
    ])

    const { cDAI } = await g$Price(chainId)
    const ratio = await cDaiPrice(web3, chainId)

    const rewardUSDC = {
        claimed: rewardG$.claimed
            .multiply(cDAI)
            .multiply(ratio)
            .multiply(1e14),
        unclaimed: rewardG$.unclaimed
            .multiply(cDAI)
            .multiply(ratio)
            .multiply(1e14)
    }

    const DAI = (await getToken(chainId, 'DAI')) as Token

    const result = {
        address,
        protocol,
        multiplier,
        rewards: {
            reward: rewardG$,
            reward$: {
                claimed: CurrencyAmount.fromFractionalAmount(
                    DAI,
                    rewardUSDC.claimed.numerator,
                    rewardUSDC.claimed.denominator
                ),
                unclaimed: CurrencyAmount.fromFractionalAmount(
                    DAI,
                    rewardUSDC.unclaimed.numerator,
                    rewardUSDC.unclaimed.denominator
                )
            },
            GDAO: rewardGDAO
        },
        stake: { amount, amount$ },
        tokens: { A: token, B: iToken }
    }

    debug('Reward $ claimed', result.rewards.reward$.claimed.toSignificant(6))
    debug('Reward $ unclaimed', result.rewards.reward$.unclaimed.toSignificant(6))

    debug('Result', result)

    debugGroupEnd(`My stake for ${address}`)

    return result
}

/**
 * Returns protocol name base on staking contact.
 * @param {string} protocolName Protocol name.
 * @returns {LIQUIDITY_PROTOCOL}
 */
const getProtocol = memoize<(protocolName: string) => LIQUIDITY_PROTOCOL>(
    (protocolName): LIQUIDITY_PROTOCOL => {
        const protocol = protocolName.startsWith('GoodCompoundStaking')
            ? LIQUIDITY_PROTOCOL.COMPOUND
            : protocolName.startsWith('GoodAaveStaking')
            ? LIQUIDITY_PROTOCOL.AAVE
            : LIQUIDITY_PROTOCOL.UNKNOWN

        debug('Protocol', protocol)

        return protocol
    }
)

/**
 * Return G$ rewards from stake for account.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {string} account User's account address.
 * @returns {Promise<MyReward>}
 */
async function getRewardG$(web3: Web3, address: string, account: string): Promise<MyReward> {
    const simpleStaking = await simpleStakingContract(web3, address)

    const { 0: claimed, 1: unclaimed } = await simpleStaking.methods.getUserMintedAndPending(account).call()

    const chainId = await getChainId(web3)

    const result = {
        claimed: CurrencyAmount.fromFractionalAmount(G$[chainId], claimed, 1e16),
        unclaimed: CurrencyAmount.fromFractionalAmount(G$[chainId], unclaimed, 1e16)
    }

    debug(`Reward G$ claimed`, result.claimed.toSignificant(6))
    debug(`Reward G$ unclaimed`, result.unclaimed.toSignificant(6))

    return result
}

/**
 * Return GDAO rewards from stake for account.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {string} account User's account address.
 */
async function getRewardGDAO(web3: Web3, address: string, account: string): Promise<MyReward> {
    const stakersDistribution = await stakersDistributionContract(web3)

    const chainId = await getChainId(web3)

    const { 0: claimed, 1: unclaimed } = await stakersDistribution.methods
        .getUserMintedAndPending([address], account)
        .call()

    const result = {
        claimed: CurrencyAmount.fromRawAmount(GDAO[chainId], claimed),
        unclaimed: CurrencyAmount.fromRawAmount(GDAO[chainId], unclaimed)
    }

    debug('Reward GDAO claimed', result.claimed.toSignificant(6))
    debug('Reward GDAO unclaimed', result.unclaimed.toSignificant(6))

    return result
}

/**
 * Return social APY.
 * @param {Web3} web3 Web3 instance.
 * @param {string} protocol Web3 instance.
 * @param {Token} token Token.
 * @param {Token} iToken Interest token.
 * @returns {Promise<Fraction>>}
 */
const getSocialAPY = memoize<(web3: Web3, protocol: string, token: Token, iToken: Token) => Promise<Fraction>>(
    async (web3, protocol, token, iToken): Promise<Fraction> => {
        const chainId = await getChainId(web3)
        const RR = await getReserveRatio(web3, chainId)

        let socialAPY = new Fraction(0)
        if (!RR.equalTo(0)) {
            if (protocol === LIQUIDITY_PROTOCOL.COMPOUND) {
                const { supplyRate, compSupplyAPY } = await compoundStaking(chainId, iToken.address)

                socialAPY = supplyRate
                    .multiply(100)
                    .add(compSupplyAPY)
                    .divide(RR)
                debug('Social APY', socialAPY.toFixed(3), '%')
            } else if (protocol === LIQUIDITY_PROTOCOL.AAVE) {
                const { percentDepositAPY, percentDepositAPR } = await aaveStaking(chainId, token.symbol!)

                socialAPY = percentDepositAPY.add(percentDepositAPR).divide(RR)
                debug('Social APY', socialAPY.toFixed(3), '%')
            }
        } else {
            debug('Social APY', 0, '%')
        }

        return socialAPY
    },
    (_, protocol, a, b) => protocol + a.address + b.address
)

/**
 * Return price of token in $ (USDC token).
 * @param {Web3} web3 Web3 instance.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @returns {Promise<Fraction>>}
 */
export const getTokenPriceInUSDC = memoize<
    (web3: Web3, protocol: LIQUIDITY_PROTOCOL, token: Token) => Promise<Fraction | null>
>(
    async (web3, protocol, token): Promise<Fraction | null> => {
        const chainId = await getChainId(web3)

        const name = `${token.symbol} price in USDC`
        debugGroup(name)

        let amount = CurrencyAmount.fromRawAmount(token, 10 ** token.decimals)
        if (protocol === LIQUIDITY_PROTOCOL.COMPOUND && token.symbol?.startsWith('c')) {
            const underlying = (await getToken(chainId, token.symbol?.substring(1))) as Token

            if (underlying) {
                const ratio = await compoundPrice(web3, token.address, chainId)
                debug('Ratio', ratio.toSignificant(6))

                let underlyingAmount = amount.multiply(ratio)

                if (underlying.decimals - token.decimals > 0) {
                    underlyingAmount = underlyingAmount.multiply(10 ** (underlying.decimals - token.decimals))
                } else {
                    underlyingAmount = underlyingAmount.divide(10 ** (token.decimals - underlying.decimals))
                }

                amount = CurrencyAmount.fromFractionalAmount(
                    underlying,
                    underlyingAmount.numerator,
                    underlyingAmount.denominator
                )
                token = underlying
            }
        }

        const USDC = await getToken(chainId, 'USDC')
        if (!USDC) {
            debug('Price', null)
            debugGroupEnd(name)
            return null
        }

        debug('Protocol', protocol)
        debug('Token', token)
        debug('Token amount', amount.toSignificant(6))

        if (token.symbol === 'USDC') {
            debug('Price', amount.toSignificant(6))
            debugGroupEnd(name)
            return amount
        }

        let price = null
        if (protocol === LIQUIDITY_PROTOCOL.COMPOUND) {
            const trade = await v2TradeExactIn(amount, USDC, { chainId, maxHops: 2 })
            debug('Trade', trade)

            if (trade) {
                debug('Price', trade.outputAmount.toSignificant(6))
                price = trade.outputAmount
            } else {
                debug('Price', null)
            }
        } else if (protocol === LIQUIDITY_PROTOCOL.AAVE) {
            price = new Fraction(1)
            debug('Price', price.toSignificant(6))
        }

        debugGroupEnd(name)

        return price
    },
    (_, protocol, token) => protocol + token.address
)

/**
 * Returns reserve ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Promise<Fraction>>}
 */
const getReserveRatio = memoize<(web3: Web3, chainId: number) => Promise<Fraction>>(
    async (web3, chainId) => {
        const marketMaker = await goodMarketMakerContract(web3)

        const { reserveRatio } = await marketMaker.methods.reserveTokens(CDAI[chainId].address).call()

        const reserveRatioFraction = new Fraction(reserveRatio.toString(), 1e6)

        debug('Reserve ratio', reserveRatioFraction.toSignificant(6))

        return reserveRatioFraction
    },
    (_, chainId) => chainId
)

/**
 * Return APY.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @returns {Promise<Fraction>>}
 */
const getAPY = memoize<(web3: Web3, address: string, protocol: LIQUIDITY_PROTOCOL, token: Token) => Promise<Fraction>>(
    async (web3, address, protocol, token) => {
        debugGroup(`APY of ${protocol} for ${token.symbol}`)

        const { DAI: G$Ratio } = await g$Price(await getChainId(web3))

        const yearlyRewardG$ = await getYearlyRewardG$(web3, address)

        const liquidity = await getLiquidity(web3, address, protocol, token)
        if (!liquidity.equalTo(new Fraction(0))) {
            const APY = yearlyRewardG$
                .multiply(G$Ratio)
                .divide(liquidity)
                .multiply(100)

            debug('APY', APY.toSignificant(6), '%')
            debugGroupEnd(`APY of ${protocol} for ${token.symbol}`)

            return APY
        }

        const zero = new Fraction(0)

        debug('APY', zero)
        debugGroupEnd(`APY of ${protocol} for ${token.symbol}`)

        return zero
    },
    (_, address, protocol, token) => address + protocol + token.address
)

/**
 * Return liquidity.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @returns {Promise<Fraction>>}
 */
const getLiquidity = memoize<
    (web3: Web3, address: string, protocol: LIQUIDITY_PROTOCOL, token: Token) => Promise<Fraction>
>(
    async (web3, address, protocol, token) => {
        const simpleStaking = await simpleStakingContract(web3, address)

        debugGroup(`Liquidity for ${token.symbol} in ${protocol} `)

        const zero = new Fraction(0)

        const account = await getAccount(web3)
        const price = await getTokenPriceInUSDC(web3, protocol, token)

        if (!price) {
            debug('Liquidity', zero)
            return zero
        }

        const { 1: totalProductivity } = await simpleStaking.methods.getProductivity(account).call()
        debug('Total Productivity', totalProductivity)

        const liquidity = new Fraction(totalProductivity, 10 ** token.decimals).multiply(price)
        debug('Liquidity', liquidity.toSignificant(6))

        debugGroupEnd(`Liquidity for ${token.symbol} in ${protocol} `)

        return liquidity
    },
    (_, address, protocol, token) => address + protocol + token.address
)

/**
 * GDAO yearly reward.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @returns {Promise<CurrencyAmount<Currency>>}
 */
const getYearlyRewardGDAO = memoize<(web3: Web3, address: string) => Promise<CurrencyAmount<Currency>>>(
    async (web3, address) => {
        const contract = await stakersDistributionContract(web3)
        const chainId = await getChainId(web3)

        const rewards = await contract.methods.rewardsPerBlock(address).call()
        const yearlyRewardGDAO = new Fraction(rewards.toString(), 1e18).multiply(2_104_400)

        debug('Yearly reward GDAO', yearlyRewardGDAO.toSignificant(6))

        return CurrencyAmount.fromFractionalAmount(
            GDAO[chainId],
            yearlyRewardGDAO.numerator,
            yearlyRewardGDAO.denominator
        )
    },
    (_, address) => address
)

/**
 * G$ yearly reward.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @returns {Promise<CurrencyAmount<Currency>>>}
 */
const getYearlyRewardG$ = memoize<(web3: Web3, address: string) => Promise<CurrencyAmount<Currency>>>(
    async (web3, address) => {
        const contract = await goodFundManagerContract(web3)
        const chainId = await getChainId(web3)

        const { blockReward } = (await contract.methods.rewardsForStakingContract(address).call()) as {
            blockReward: BigNumber
        }
        const yearlyRewardG$ = new Fraction(blockReward.toString(), 1e2).multiply(2_104_400)

        debug('Yearly reward G$', yearlyRewardG$.toSignificant(6))

        return CurrencyAmount.fromFractionalAmount(G$[chainId], yearlyRewardG$.numerator, yearlyRewardG$.denominator)
    },
    (_, address) => address
)

/**
 * Common information for approve token spend and stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} amount Amount of tokens to stake.
 * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
 * @returns {Promise<{ address: string, amount: string }}
 */
async function stakeMeta(
    web3: Web3,
    address: string,
    amount: number | string,
    inInterestToken: boolean = false
): Promise<{ address: string; amount: string }> {
    const contract = simpleStakingContract(web3, address)

    let tokenAddress
    if (inInterestToken) {
        tokenAddress = await contract.methods.iToken().call()
    } else {
        tokenAddress = await contract.methods.token().call()
    }

    const token = (await getTokenByAddress(web3, tokenAddress)) as Token

    const tokenAmount = CurrencyAmount.fromRawAmount(token, decimalToJSBI(amount, token.decimals))
    const tokenRawAmount = tokenAmount.multiply(tokenAmount.decimalScale).toFixed(0)

    debug('Amount', tokenAmount.toSignificant(6))
    debug('In interest token', inInterestToken)

    return { address: tokenAddress, amount: tokenRawAmount }
}

/**
 * Approve token spend for stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} amount Amount of tokens to stake.
 * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
 * @returns {Promise<void>}
 */
export async function approve(
    web3: Web3,
    address: string,
    amount: number | string,
    inInterestToken: boolean = false
): Promise<void> {
    const account = await getAccount(web3)

    const meta = await stakeMeta(web3, address, amount, inInterestToken)

    await ERC20Contract(web3, meta.address)
        .methods.approve(address, meta.amount)
        .send({ from: account })
}

/**
 * Make a stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} amount Amount of tokens to stake.
 * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
 * @returns {Promise<void>}
 */
export async function stake(
    web3: Web3,
    address: string,
    amount: number | string,
    inInterestToken: boolean = false
): Promise<void> {
    const contract = simpleStakingContract(web3, address)
    const account = await getAccount(web3)

    const percentage = decimalPercentToPercent(0)

    const meta = await stakeMeta(web3, address, amount, inInterestToken)

    await contract.methods.stake(meta.amount, percentage.toFixed(0), inInterestToken).send({ from: account })
}

/**
 * Withdraw a stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} percent How much to withdraw in percent relativity.
 * @returns {Promise<void>}
 */
export async function withdraw(web3: Web3, address: string, percent: number): Promise<void> {
    const contract = simpleStakingContract(web3, address)

    const account = await getAccount(web3)

    const [tokenAddress, users] = await Promise.all([
        contract.methods.token().call(),
        contract.methods.users(account).call()
    ])

    const percentage = decimalPercentToPercent(percent)
    const token = (await getTokenByAddress(web3, tokenAddress)) as Token

    const amount = CurrencyAmount.fromRawAmount(token, users.amount.toString())
    debug('Total amount', amount.toSignificant(6))

    const rawAmount = amount.multiply(percentage)
    debug('Withdraw amount', rawAmount.toSignificant(6))

    await contract.methods
        .withdrawStake(rawAmount.multiply(amount.decimalScale).toFixed(0), false)
        .send({ from: account })
}

/**
 * Claim rewards from staking.
 * @param {Web3} web3 Web3 instance.
 */
export async function claim(web3: Web3): Promise<void> {
    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    const simpleStakingAddresses = await getSimpleStakingContractAddresses(web3)

    let totalRewardGDAO = CurrencyAmount.fromRawAmount(GDAO[chainId], 0) as CurrencyAmount<Currency>
    for (const address of simpleStakingAddresses) {
        const [rewardG$, rewardGDAO] = await Promise.all([
            getRewardG$(web3, address, account),
            getRewardGDAO(web3, address, account)
        ])

        if (!rewardGDAO.unclaimed.equalTo(0)) {
            totalRewardGDAO = totalRewardGDAO.add(rewardGDAO.unclaimed)
        }

        if (!rewardG$.unclaimed.equalTo(0)) {
            const simpleStaking = simpleStakingContract(web3, address)
            await simpleStaking.methods.withdrawRewards().send({ from: account })
        }
    }

    if (!totalRewardGDAO.equalTo(0)) {
        const stakersDistribution = await stakersDistributionContract(web3)
        await stakersDistribution.methods.claimReputation(account, simpleStakingAddresses).send({ from: account })
    }
}
