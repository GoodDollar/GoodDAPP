import Web3 from 'web3'
import memoize from 'lodash/memoize'
import { BigNumber, ethers } from 'ethers'
import { Currency, CurrencyAmount, Fraction, MaxUint256, Percent, Token } from '@uniswap/sdk-core'
import { MaxUint256 as MaxApproveValue } from '@ethersproject/constants'
import { getSimpleStakingContractAddresses, simpleStakingContract } from './contracts/SimpleStakingContract'
import { governanceStakingContract } from './contracts/GovernanceStakingContract'
import { goodFundManagerContract } from './contracts/GoodFundManagerContract'
import { goodMarketMakerContract } from './contracts/GoodMarketMakerContract'
import { getToken, getTokenByAddress } from './methods/tokenLists'
import { getAccount, getChainId } from './utils/web3'
import { aaveStaking, g$Price } from './apollo'
import { compoundStaking } from './rest'
import { LIQUIDITY_PROTOCOL } from './constants/protocols'
import { debug, DEBUG_ENABLED, debugGroup, debugGroupEnd } from './utils/debug'
import { stakersDistributionContract } from './contracts/StakersDistributionContract'
import { CDAI, G$, GDAO, USDC, DAI } from './constants/tokens'
import { cacheClear } from './utils/memoize'
import { decimalPercentToPercent, decimalToJSBI } from './utils/converter'
import { ERC20Contract } from './contracts/ERC20Contract'
import { compoundPrice } from './methods/compoundPrice'
import { v2TradeExactIn } from './methods/v2TradeExactIn'
import { cDaiPrice } from './methods/cDaiPrice'
import { TransactionDetails } from './constants/transactions'
import { DAO_NETWORK, SupportedChainId } from './constants/chains'
import { getContract } from './utils/getContract'

export type Stake = {
    APY?: Fraction
    address: string
    protocol: LIQUIDITY_PROTOCOL
    liquidity: Fraction
    rewards: { G$: CurrencyAmount<Currency>; GDAO: CurrencyAmount<Currency> }
    socialAPY: Fraction
    tokens: { A: Token; B: Token }
}

type MyReward = { claimed: CurrencyAmount<Currency>; unclaimed: CurrencyAmount<Currency> }

export type MyStake = {
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
    network: DAO_NETWORK
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
    cacheClear(getStakedValue)
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
 * @param {string} account account address to get staking data for.
 * @returns {Promise<Stake[]>}
 */
export async function getMyList(mainnetWeb3: Web3, fuseWeb3: Web3, account: string): Promise<MyStake[]> {
    const simpleStakingAddresses = await getSimpleStakingContractAddresses(mainnetWeb3)

    cacheClear(getTokenPriceInUSDC)

    let stakes: MyStake[] = []
    try {
        const govStake = metaMyGovStake(fuseWeb3, account)
        const ps = simpleStakingAddresses.map(address => metaMyStake(mainnetWeb3, address, account))
        ps.push(govStake)
        const stakesRawList = await Promise.all(ps)
        stakes = stakesRawList.filter(Boolean) as MyStake[]
    } catch (e) {
        console.log(e)
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
        getStakedValue(web3, address, protocol, token),
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
 *  @param {string} account account details to fetch.
 * @returns {Promise<Stake | null>}
 */
async function metaMyStake(web3: Web3, address: string, account: string): Promise<MyStake | null> {
    debugGroup(`My stake for ${address}`)

    const simpleStaking = await simpleStakingContract(web3, address)

    const chainId = await getChainId(web3)

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

    const { cDAI } = await g$Price()
    const ratio = await cDaiPrice(web3, chainId)

    const rewardUSDC = {
        claimed: rewardG$.claimed
            .multiply(cDAI)
            .multiply(ratio)
            .multiply(1e16),
        unclaimed: rewardG$.unclaimed
            .multiply(cDAI)
            .multiply(ratio)
            .multiply(1e16)
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
        tokens: { A: token, B: iToken },
        network: DAO_NETWORK.MAINNET
    }

    debug('Reward $ claimed', result.rewards.reward$.claimed.toSignificant(6))
    debug('Reward $ unclaimed', result.rewards.reward$.unclaimed.toSignificant(6))

    debug('Result', result)

    debugGroupEnd(`My stake for ${address}`)

    return result
}

/**
 * Returns meta for mine stake with rewards.
 * @param {Web3} web3 Web3 instance.
 *  @param {string} account account details to fetch.
 * @returns {Promise<Stake | null>}
 */
async function metaMyGovStake(web3: Web3, account: string): Promise<MyStake | null> {
    const govStaking = governanceStakingContract(web3)

    const G$Token = G$[SupportedChainId.FUSE] //gov is always on fuse
    const users = await govStaking.methods.users(account).call()
    if (!users || parseInt(users.amount.toString()) === 0) {
        return null
    }

    const amount = CurrencyAmount.fromRawAmount(G$Token, users.amount.toString())

    const tokenPrice = await g$Price()

    let amount$ = CurrencyAmount.fromRawAmount(G$Token, 0)
    if (tokenPrice) {
        const value = tokenPrice.DAI.multiply(users.amount.toString())
        amount$ = CurrencyAmount.fromFractionalAmount(G$Token, value.numerator, value.denominator)
    }

    const unclaimed = await govStaking.methods.getUserPendingReward(account).call()
    const rewardGDAO = {
        claimed: CurrencyAmount.fromRawAmount(GDAO[SupportedChainId.FUSE], users.rewardMinted.toString()),
        unclaimed: CurrencyAmount.fromRawAmount(GDAO[SupportedChainId.FUSE], unclaimed.toString())
    }

    const result = {
        address: (govStaking as any)._address,
        protocol: LIQUIDITY_PROTOCOL.GOODDAO,
        multiplier: false,
        rewards: {
            reward: {
                claimed: CurrencyAmount.fromRawAmount(G$Token, 0),
                unclaimed: CurrencyAmount.fromRawAmount(G$Token, 0)
            },
            reward$: {
                claimed: CurrencyAmount.fromRawAmount(G$Token, 0),
                unclaimed: CurrencyAmount.fromRawAmount(G$Token, 0)
            },
            GDAO: rewardGDAO
        },
        stake: { amount, amount$ },
        tokens: { A: G$Token, B: G$Token },
        network: DAO_NETWORK.FUSE
    }
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
        claimed: CurrencyAmount.fromRawAmount(G$[chainId], claimed),
        unclaimed: CurrencyAmount.fromRawAmount(G$[chainId], unclaimed)
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
        let result = { supplyAPY: socialAPY, incentiveAPY: socialAPY }
        if (!RR.equalTo(0)) {
            if (protocol === LIQUIDITY_PROTOCOL.COMPOUND) {
                result = await compoundStaking(chainId, iToken.address)
                debug('compound Social APY', result)
            } else if (protocol === LIQUIDITY_PROTOCOL.AAVE) {
                result = await aaveStaking(chainId, token)
                debug('Aave Social APY', result)
            }
        }
        const { supplyAPY, incentiveAPY } = result
        socialAPY = supplyAPY
            .multiply(100)
            .add(incentiveAPY)
            .divide(RR)
        debug('Social APY', socialAPY.toFixed(2), '%')
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

export const getReserveSocialAPY = memoize<(web3: Web3, chainId: number) => Promise<Fraction>>(
    async (web3, chainId) => {
        const marketMaker = await goodMarketMakerContract(web3)

        const [{ reserveRatio, reserveSupply, gdSupply }, currentPrice, dailyExpansionRate] = await Promise.all([
            marketMaker.methods.reserveTokens(CDAI[chainId].address).call(),
            marketMaker.methods.currentPrice(CDAI[chainId].address).call(),
            marketMaker.methods.reserveRatioDailyExpansion().call()
        ])

        // (reservebalance / (newreserveratio * currentprice)) - gdsupply
        const rr = reserveRatio / 1e6
        const yearlyDecline = (2 - dailyExpansionRate / 1e27) ** 365

        const newRR = rr * (2 - yearlyDecline)
        const denom = newRR * (currentPrice / 1e8)
        const gdGenerated = reserveSupply / 1e8 / denom - gdSupply / 1e2
        const socialAPY = new Fraction((gdGenerated * 1e2).toFixed(0), gdSupply).multiply(100) //mul by 100 to return as percentages

        return socialAPY
    },
    (_, chainId) => chainId
)
/**
 * Returns reserve ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Promise<Fraction>>}
 */
export const getReserveRatio = memoize<(web3: Web3, chainId: number) => Promise<Fraction>>(
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

        const { DAI: G$Ratio } = await g$Price()

        const yearlyRewardG$ = await getYearlyRewardG$(web3, address)

        let stakedValue = await getStakedValue(web3, address, protocol, token, true)

        stakedValue = stakedValue.equalTo(0)
            ? CurrencyAmount.fromRawAmount(stakedValue.currency, 10 ** stakedValue.currency.decimals * 1000) //1000$
            : stakedValue

        const APY = yearlyRewardG$
            .multiply(G$Ratio)
            .multiply(yearlyRewardG$.decimalScale)
            .divide(stakedValue)
            .multiply(1e6)

        debug('APY', APY.toSignificant(6), '%')
        debugGroupEnd(`APY of ${protocol} for ${token.symbol}`)

        return APY
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
        const chainId = await getChainId(web3)
        const simpleStaking = await simpleStakingContract(web3, address)

        debugGroup(`Liquidity for ${token.symbol} in ${protocol} `)

        const zero = new Fraction(0)

        const account = await getAccount(web3)
        const price = await getTokenPriceInUSDC(web3, protocol, token)

        if (!price) {
            debug('Liquidity', zero)
            return zero
        }

        const USDC = (await getToken(chainId, 'USDC')) as Token

        const totalProductivity = await simpleStaking.methods.totalProductivity().call()
        debug('Total Productivity', totalProductivity)

        const liquidity = new Fraction(totalProductivity.toString(), 1).multiply(price).divide(10 ** token.decimals)

        const liquidityUSDC = CurrencyAmount.fromFractionalAmount(USDC, liquidity.numerator, liquidity.denominator)

        debug('Liquidity', liquidityUSDC.toSignificant(6))

        debugGroupEnd(`Liquidity for ${token.symbol} in ${protocol}`)

        return liquidityUSDC
    },
    (_, address, protocol, token) => address + protocol + token.address
)

/**
 * Return staked value in USD.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {LIQUIDITY_PROTOCOL} protocol Liquidity protocol.
 * @param {Token} token Token for calculation price from.
 * @param {boolean} effectiveStake get effective stakes, not donated
 * @returns {Promise<Fraction>>}
 */
const getStakedValue = memoize<
    (
        web3: Web3,
        address: string,
        protocol: LIQUIDITY_PROTOCOL,
        token: Token,
        effectiveStake?: boolean
    ) => Promise<CurrencyAmount<Currency>>
>(
    async (web3, address, protocol, token, effectiveStake = false) => {
        const chainId = await getChainId(web3)
        const simpleStaking = getContract(
            chainId,
            address,
            [
                'function totalProductivity() view returns (uint256)',
                'function totalEffectiveStakes() view returns (uint256)',
                'function tokenUsdOracle() view returns (address)',
                'function getTokenValueInUSD(address, uint256, uint256) view returns (uint256)',
                'function tokenDecimalDifference() view returns (uint256)'
            ],
            web3
        )

        const USDC = (await getToken(chainId, 'USDC')) as Token

        const [totalProductivity, usdOracle, tokenDecimalsDiffFrom18] = await Promise.all([
            effectiveStake ? simpleStaking.totalEffectiveStakes() : simpleStaking.totalProductivity(),
            simpleStaking.tokenUsdOracle(),
            simpleStaking.tokenDecimalDifference()
        ])

        const usdValue = await simpleStaking.getTokenValueInUSD(
            usdOracle,
            totalProductivity,
            18 - tokenDecimalsDiffFrom18.toNumber()
        )

        const liquidityUSDC = CurrencyAmount.fromRawAmount(USDC, usdValue.div(1e2).toString()) //token value in usd is in 8 decimals

        debug('Liquidity staked', liquidityUSDC.toSignificant(6))

        debugGroupEnd(`Liquidity for ${token.symbol} in ${protocol}`)

        return liquidityUSDC
    },
    (_, address, protocol, token, effectiveStake) => address + protocol + token.address + effectiveStake
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
        const yearlyRewardGDAO = CurrencyAmount.fromRawAmount(GDAO[chainId], rewards.toString()).multiply(2_104_400)

        debug('Yearly reward GDAO', address, rewards, yearlyRewardGDAO.toSignificant(6))

        return yearlyRewardGDAO
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
        const yearlyRewardG$ = CurrencyAmount.fromRawAmount(G$[chainId], blockReward.toString()).multiply(2_104_400)

        debug('Yearly reward G$', yearlyRewardG$.toSignificant(6))

        return yearlyRewardG$
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
    inInterestToken = false
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
 * @param {function} [onSent] calls when a transaction sent to a blockchain
 * @returns {Promise<void>}
 */
export async function approve(
    web3: Web3,
    spender: string,
    amount: string,
    token: Token,
    onSent?: (transactionHash: string) => void
): Promise<void> {
    const account = await getAccount(web3)

    const tokenAmount = amount.toBigNumber(token.decimals)
    // const meta = await stakeMeta(web3, address, amount, inInterestToken)
    const erc20 = ERC20Contract(web3, token.address)
    const allowance = await erc20.methods
        .allowance(account, spender)
        .call()
        .then((_: string) => BigNumber.from(_))

    if (tokenAmount.lte(allowance)) return
    const req = ERC20Contract(web3, token.address)
        .methods.approve(spender, MaxApproveValue.toString())
        .send({ from: account })

    if (onSent) req.on('transactionHash', onSent)

    await req
}

/**
 * Make a stake in the governance staking contract
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} amount Amount of tokens to stake.
 * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
 * @param {function} [onSent] calls when a transaction sent to a blockchain
 * @returns {Promise<void>}
 */
export async function stakeGov(
    web3: Web3,
    address: string,
    amount: string,
    token: Token,
    inInterestToken = false, //unused - only for compatability with the stake method
    onSent?: (transactionHash: string, from: string) => void
): Promise<TransactionDetails> {
    const contract = governanceStakingContract(web3, address)
    const account = await getAccount(web3)

    const tokenAmount = amount.toBigNumber(token.decimals)
    const req = contract.methods.stake(tokenAmount).send({ from: account })

    if (onSent) req.on('transactionHash', (hash: string) =>  onSent(hash, account))

    return req
}

/**
 * Make a stake.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Stake address.
 * @param {number} amount Amount of tokens to stake.
 * @param {boolean} inInterestToken Staking with token (false) or interest token (true)
 * @param {function} [onSent] calls when a transaction sent to a blockchain
 * @returns {Promise<void>}
 */
export async function stake(
    web3: Web3,
    address: string,
    amount: string,
    token: Token,
    inInterestToken = false,
    onSent?: (transactionHash: string, from: string) => void
): Promise<TransactionDetails> {
    const contract = simpleStakingContract(web3, address)
    const account = await getAccount(web3)

    const percentage = decimalPercentToPercent(0)

    const tokenAmount = amount.toBigNumber(token.decimals)

    const req = contract.methods.stake(tokenAmount, percentage.toFixed(0), inInterestToken).send({ from: account })

    if (onSent) req.on('transactionHash', (hash: string) =>  onSent(hash, account))

    return req
}

/**
 * Withdraw a stake.
 * @param {Web3} web3 Web3 instance.
 * @param {MyStake} stake Stake address.
 * @param {string} percentage How much to withdraw in percentages.
 * @param {function} [onSent] calls when a transaction sent to a blockchain
 * @returns {Promise<void>}
 */
export async function withdraw(
    web3: Web3,
    stake: MyStake,
    percentage: string,
    onSent?: (transactionHash: string, from: string) => void,
    onReceipt?: () => void,
    onError?: (e:any) => void
): Promise<TransactionDetails> {
    const contract =
        stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO
            ? governanceStakingContract(web3, stake.address)
            : simpleStakingContract(web3, stake.address)

    const account = await getAccount(web3)

    const toWithdraw = stake.stake.amount
        .multiply(new Percent(percentage, 100))
        .multiply(stake.stake.amount.decimalScale)
        .toFixed(0)

    let req
    if (stake.protocol === LIQUIDITY_PROTOCOL.GOODDAO)
        req = contract.methods.withdrawStake(toWithdraw).send({ from: account })
    else req = contract.methods.withdrawStake(toWithdraw, false).send({ from: account })

    if (onSent) req.on('transactionHash', (hash: string) => onSent(hash, account))
    if (onReceipt) req.on('receipt', onReceipt)
    if (onError) req.on('error', onError)

    return req
}

/**
 * Claim GOOD rewards from staking.
 * @param {Web3} web3 Web3 instance.
 * @param {function} [onSent] calls when transactions sent to a blockchain
 */
export async function claimGood(
    web3: Web3,
    onSent?: (firstTransactionHash: string, from: string, chainId: number) => void,
    onReceipt?: () => void,
    onError?: (e:any) => void
): Promise<TransactionDetails[]> {
    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    let tx
    if (chainId === SupportedChainId.FUSE) {
        const contract = governanceStakingContract(web3)
        tx = contract.methods.withdrawRewards().send({ from: account })
    } else {
        const stakersDistribution = await stakersDistributionContract(web3)
        const simpleStakingAddresses = await getSimpleStakingContractAddresses(web3)
        tx = stakersDistribution.methods.claimReputation(account, simpleStakingAddresses).send({ from: account })
    }
     
    if (onSent) tx.on('transactionHash', (hash: string) => onSent(hash, account, chainId))
    if (onReceipt) tx.on('receipt', onReceipt)
    if (onError) tx.on('error', onError)
    return [tx]
}

/**
 * Claim G$ rewards from staking.
 * @param {Web3} web3 Web3 instance.
 * @param {function} [onSent] calls when transactions sent to a blockchain
 */
export async function claim(
    web3: Web3,
    onSent?: (firstTransactionHash: string, from: string, chainId: number) => void,
    onReceipt?: () => void
): Promise<TransactionDetails[]> {
    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    const simpleStakingAddresses = await getSimpleStakingContractAddresses(web3)

    const transactions: any[] = []
    for (const address of simpleStakingAddresses) {
        const [rewardG$, rewardGDAO] = await Promise.all([
            getRewardG$(web3, address, account),
            getRewardGDAO(web3, address, account)
        ])

        if (!rewardG$.unclaimed.equalTo(0)) {
            const simpleStaking = simpleStakingContract(web3, address)
            transactions.push(simpleStaking.methods.withdrawRewards().send({ from: account }))
        }
    }

    if (onSent) {
        Promise.all(
            transactions.map(
                transaction =>
                    new Promise<string>((resolve, reject) => {
                        transaction.on('transactionHash', (hash: string) => onSent(hash, account, chainId))
                        transaction.on('receipt', onReceipt)
                        transaction.on('error', reject)
                        resolve('done')
                    }) 
            )
        )
    }

    return Promise.all(transactions)
}
