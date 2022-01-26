import Web3 from 'web3'
import { BigNumber, ethers } from 'ethers'
import {
    Currency,
    CurrencyAmount,
    Ether,
    Fraction,
    Percent,
    Token,
    TradeType,
    computePriceImpact
} from '@uniswap/sdk-core'
import { Trade } from '@uniswap/v2-sdk'
import { MaxUint256 } from '@ethersproject/constants'
import { getToken } from './methods/tokenLists'
import { decimalPercentToPercent, decimalToJSBI } from './utils/converter'
import { CDAI, FUSE } from './constants/tokens'
import { cDaiPrice } from './methods/cDaiPrice'
import { v2TradeExactIn } from './methods/v2TradeExactIn'
import { goodMarketMakerContract } from './contracts/GoodMarketMakerContract'
import { getAccount, getChainId } from './utils/web3'
import { InsufficientLiquidity, UnexpectedToken, UnsupportedChainId, UnsupportedToken } from './utils/errors'
import { debug, debugGroup, debugGroupEnd } from './utils/debug'
import { g$Price } from './apollo'
import { ZERO_PERCENT } from './constants/misc'
import { exchangeHelperContract } from './contracts/ExchangeHelperContract'
import { ERC20Contract } from './contracts/ERC20Contract'
import { G$ContractAddresses } from './constants/addresses'
import { computeRealizedLPFeePercent } from './utils/prices'
import { SupportedChainId } from './constants/chains'
import { v2TradeExactOut } from './methods/v2TradeExactOut'
// eslint-disable-next-line import/no-cycle
import { cDaiToDai, G$ToCDai } from './sell'
import * as fuse from './contracts/FuseUniswapContract'
import { exec } from 'child_process'
import { Price } from '@uniswap/sdk-core'
import { g$ReservePrice } from './methods/g$price'

export type BuyInfo = {
    inputAmount: CurrencyAmount<Currency>
    outputAmount: CurrencyAmount<Currency>
    minimumOutputAmount: CurrencyAmount<Currency>

    DAIAmount: CurrencyAmount<Currency> | null
    cDAIAmount: CurrencyAmount<Currency> | null
    GDXAmount: CurrencyAmount<Currency> | Fraction

    priceImpact: Fraction
    slippageTolerance: Percent

    liquidityFee: CurrencyAmount<Currency>
    liquidityToken: Currency

    route: Token[]
    trade: Trade<Currency, Currency, TradeType> | null
}

type DAIResult = {
    amount: CurrencyAmount<Currency>
    minAmount: CurrencyAmount<Currency>
    route: Token[]
    trade: Trade<Currency, Currency, TradeType>
}

type G$Result = Omit<DAIResult, 'route' | 'trade'>

/**
 * Tries to convert token X into DAI. If it impossible - returns null.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} currency Token X currency amount instance.
 * @param {Percent} slippageTolerance Slippage tolerance.
 * @returns {DAIResult | null}
 */
export async function xToDaiExactIn(
    web3: Web3,
    currency: CurrencyAmount<Currency>,
    slippageTolerance: Percent
): Promise<DAIResult | null> {
    const chainId = await getChainId(web3)
    const DAI = (await getToken(chainId, 'DAI')) as Token

    debugGroup(`${currency.currency.symbol} to DAI`)

    const trade = await v2TradeExactIn(currency, DAI, { chainId })
    if (!trade) {
        debug('Trade', null)
        debugGroupEnd(`${currency.currency.symbol} to DAI`)

        return null
    }

    const amount = trade.outputAmount
    debug('DAI', amount.toSignificant(6))

    const minAmount = trade.minimumAmountOut(slippageTolerance)
    debug('DAI min', minAmount.toSignificant(6))

    debugGroupEnd(`${currency.currency.symbol} to DAI`)

    return { amount, minAmount, route: trade.route.path, trade }
}

/**
 * Tries to get amount of token X from DAI. If it impossible - returns null.
 * @param {Web3} web3 Web3 instance.
 * @param {Currency} currency Token X currency amount instance.
 * @param {CurrencyAmount<Currency>} DAI Token DAI currency amount instance.
 * @returns {DAIResult | null}
 */
export async function xToDaiExactOut(
    web3: Web3,
    currency: Currency,
    DAI: CurrencyAmount<Currency>
): Promise<CurrencyAmount<Currency> | null> {
    const chainId = await getChainId(web3)

    debugGroup(`${currency.symbol} to DAI`)

    const trade = await v2TradeExactOut(currency, DAI, { chainId })
    if (!trade) {
        debug('Trade', null)
        debugGroupEnd(`${currency.symbol} to DAI`)

        return null
    }

    debug(currency.symbol, trade.inputAmount.toSignificant(6))
    debugGroupEnd(`${currency.symbol} to DAI`)

    return trade.inputAmount
}

/**
 * Tries to convert token X into G$. If it impossible - returns null.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} currency Token X currency amount instance.
 * @param {Percent} slippageTolerance Slippage tolerance.
 * @returns {DAIResult | null}
 */
export async function xToG$ExactIn(
    web3: Web3,
    currency: CurrencyAmount<Currency>,
    slippageTolerance: Percent
): Promise<DAIResult | null> {
    const chainId = await getChainId(web3)

    const G$ = (await getToken(chainId, 'G$')) as Token

    debugGroup(`${currency.currency.symbol} to G$`)

    const trade = await v2TradeExactIn(currency, G$, { chainId })
    if (!trade) {
        debug('Trade', null)
        debugGroupEnd(`${currency.currency.symbol} to G$`)

        return null
    }

    const amount = trade.outputAmount
    debug('G$', amount.toSignificant(6))

    const minAmount = trade.minimumAmountOut(slippageTolerance)
    debug('G$ min', minAmount.toSignificant(6))

    debugGroupEnd(`${currency.currency.symbol} to G$`)

    return { amount, minAmount, route: trade.route.path, trade }
}

/**
 * Tries to get amount of token X from G$. If it impossible - returns null.
 * @param {Web3} web3 Web3 instance.
 * @param {Currency} currency Token X currency amount instance.
 * @param {CurrencyAmount<Currency>} G$ Token G$ currency amount instance.
 * @returns {DAIResult | null}
 */
export async function xToG$ExactOut(
    web3: Web3,
    currency: Currency,
    G$: CurrencyAmount<Currency>
): Promise<CurrencyAmount<Currency> | null> {
    const chainId = await getChainId(web3)

    debugGroup(`${currency.symbol} to G$`)

    const trade = await v2TradeExactOut(currency, G$, { chainId })
    if (!trade) {
        debug('Trade', null)
        debugGroupEnd(`${currency.symbol} to G$`)

        return null
    }

    debug(currency.symbol, trade.inputAmount.toSignificant(6))
    debugGroupEnd(`${currency.symbol} to G$`)

    return trade.inputAmount
}

/**
 * Tries to convert token DAI into cDAI.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} currency DAI token amount.
 * @returns {CurrencyAmount<Currency>}
 * @throws {UnexpectedToken} If currency not DAI.
 */
export async function daiToCDai(web3: Web3, currency: CurrencyAmount<Currency>): Promise<CurrencyAmount<Currency>> {
    if (currency.currency.symbol !== 'DAI') {
        throw new UnexpectedToken(currency.currency.symbol)
    }

    const chainId = await getChainId(web3)

    debugGroup(`DAI to cDAI`)

    const cDaiPriceRatio = await cDaiPrice(web3, chainId)
    debug('cDAI ratio', cDaiPriceRatio.toSignificant(6))

    // DAI is 18 decimal number, cDAI is 8 decimal number, need to reduce 10 - 8 = 10 decimals from final value
    const _cDaiOutput = currency.divide(cDaiPriceRatio).divide(1e10)
    const amount = CurrencyAmount.fromFractionalAmount(CDAI[chainId], _cDaiOutput.numerator, _cDaiOutput.denominator)

    debug('cDAI', amount.toSignificant(6))
    debugGroupEnd(`DAI to cDAI`)

    return amount
}

let index = 0

/**
 * Tries to convert token cDAI into G$.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} currency CDAI token amount.
 * @param {Percent} slippageTolerance Slippage tolerance.
 * @returns {G$Result}
 * @throws {UnexpectedToken} If currency not cDAI.
 */
export async function cDaiToG$(
    web3: Web3,
    currency: CurrencyAmount<Currency>,
    slippageTolerance: Percent
): Promise<G$Result> {
    if (currency.currency.symbol !== 'cDAI') {
        throw new UnexpectedToken(currency.currency.symbol)
    }

    const chainId = await getChainId(web3)
    const goodMarketMaker = await goodMarketMakerContract(web3)
    const G$ = (await getToken(chainId, 'G$')) as Token

    const _index = ++index
    debugGroup(`cDAI to G$ - ${_index}`)

    const bigNumber = currency.multiply(currency.decimalScale).toFixed(0)
    const _priceMinimumOutputAmount = (await goodMarketMaker.methods
        .buyReturn(CDAI[chainId].address, bigNumber)
        .call()) as BigNumber

    const amount = CurrencyAmount.fromRawAmount(G$, _priceMinimumOutputAmount.toString())
    debug('G$', amount.toSignificant(6))

    const minAmount = amount.subtract(amount.multiply(slippageTolerance))
    debug('G$ min', minAmount.toSignificant(6))

    debugGroupEnd(`cDAI to G$ - ${_index}`)
    index--

    return { amount, minAmount }
}

/**
 * Calculates liquidity fee.
 * @param {Trade<Currency, Currency, TradeType>} trade Currency amount.
 * @returns {Fraction}
 */
function getLiquidityFee(trade: Trade<Currency, Currency, TradeType>): CurrencyAmount<Currency> {
    const realizedLpFeePercent = computeRealizedLPFeePercent(trade)

    debug('Liquidity fee', realizedLpFeePercent.toSignificant(6))
    const liquidityFee = trade.inputAmount.multiply(realizedLpFeePercent)
    return liquidityFee
}

/**
 * Returns trade information for buying G$.
 * @param {Web3} web3 Web3 instance.
 * @param {string} fromSymbol Symbol of the token that you want to use to buy G$.
 * @param {number | string} amount Amount of given currency.
 * @param {number} slippageTolerance Slippage tolerance while exchange tokens.
 * @returns {Promise<BuyInfo | null>}
 */
export async function getMeta(
    web3: Web3,
    fromSymbol: string,
    amount: number | string,
    slippageTolerance = 0.5
): Promise<BuyInfo | null> {
    const chainId = await getChainId(web3)
    console.log('CHAIN ID:', chainId)

    debugGroup(`Get meta ${amount} ${fromSymbol} to G$`)

    const G$ = (await getToken(chainId, 'G$')) as Token

    if (!G$) {
        throw new UnsupportedChainId(chainId)
    }

    let FROM: Currency
    if (fromSymbol === 'ETH') {
        FROM = Ether.onChain(chainId)
    } else if (fromSymbol === 'FUSE') {
        FROM = FUSE
    } else {
        FROM = (await getToken(chainId, fromSymbol)) as Currency
    }

    if (!FROM) {
        throw new UnsupportedToken(fromSymbol)
    }

    const DAI = (await getToken(chainId, 'DAI')) as Token

    let inputCDAIValue
    let DAIAmount: CurrencyAmount<Currency> | null = null
    let cDAIAmount: CurrencyAmount<Currency> | null = null

    let inputAmount: CurrencyAmount<Currency>
    let outputAmount: CurrencyAmount<Currency>
    let minimumOutputAmount: CurrencyAmount<Currency>
    let route: Token[]
    let trade: Trade<Currency, Currency, TradeType> | null = null

    let liquidityFee = CurrencyAmount.fromRawAmount(FROM, '0')
    let priceImpact = new Fraction(0)

    const slippageTolerancePercent = decimalPercentToPercent(slippageTolerance)

    if (chainId === SupportedChainId.FUSE) {
        inputAmount = CurrencyAmount.fromRawAmount(FROM, decimalToJSBI(amount, FROM.decimals))

        const g$trade = await xToG$ExactIn(web3, inputAmount, slippageTolerancePercent)

        if (!g$trade) {
            return null
        }

        trade = g$trade.trade
        route = g$trade.route

        liquidityFee = getLiquidityFee(g$trade.trade)

        outputAmount = g$trade.amount
        minimumOutputAmount = g$trade.minAmount

        priceImpact = g$trade.trade.priceImpact
    } else {
        if (FROM.symbol === 'G$') {
            return null
        } else if (FROM.symbol === 'cDAI') {
            const cDAI = CDAI[chainId]
            route = [cDAI]

            inputAmount = CurrencyAmount.fromRawAmount(cDAI, decimalToJSBI(amount, cDAI.decimals))

            DAIAmount = CurrencyAmount.fromRawAmount(DAI, 0)
            inputCDAIValue = cDAIAmount = inputAmount
            ;({ amount: outputAmount, minAmount: minimumOutputAmount } = await cDaiToG$(
                web3,
                inputAmount,
                slippageTolerancePercent
            ))
        } else if (FROM.symbol === 'DAI') {
            const DAI = (await getToken(chainId, 'DAI')) as Token
            route = [DAI]

            inputAmount = CurrencyAmount.fromRawAmount(DAI, decimalToJSBI(amount, DAI.decimals))

            DAIAmount = inputAmount
            inputCDAIValue = cDAIAmount = await daiToCDai(web3, DAIAmount)
            ;({ amount: outputAmount, minAmount: minimumOutputAmount } = await cDaiToG$(
                web3,
                cDAIAmount,
                slippageTolerancePercent
            ))
        } else {
            inputAmount = CurrencyAmount.fromRawAmount(FROM, decimalToJSBI(amount, FROM.decimals))

            const g$trade = await xToDaiExactIn(web3, inputAmount, slippageTolerancePercent)

            if (!g$trade) {
                return null
            }

            DAIAmount = g$trade.minAmount
            cDAIAmount = await daiToCDai(web3, DAIAmount)

            inputCDAIValue = await daiToCDai(
                web3,
                g$trade.amount.add(g$trade.amount.multiply(g$trade.trade.priceImpact))
            )

            route = g$trade.route

            liquidityFee = getLiquidityFee(g$trade.trade)
            ;[{ amount: outputAmount }, { minAmount: minimumOutputAmount }] = await Promise.all([
                daiToCDai(web3, g$trade.amount).then(cDAI => cDaiToG$(web3, cDAI, ZERO_PERCENT)),
                cDaiToG$(web3, cDAIAmount, ZERO_PERCENT)
            ])

            trade = g$trade.trade
        }

        const { cDAI: price } = await g$ReservePrice(web3, chainId)
        priceImpact = computePriceImpact(price, inputCDAIValue, outputAmount)
    }

    debugGroupEnd(`Get meta ${amount} ${fromSymbol} to G$`)
    debug('Route', route)

    return {
        inputAmount,
        outputAmount,
        minimumOutputAmount,

        DAIAmount,
        cDAIAmount,
        GDXAmount: outputAmount,

        priceImpact,
        slippageTolerance: slippageTolerancePercent,

        liquidityFee,
        liquidityToken: FROM,

        route,
        trade
    }
}

/**
 * Returns trade information for buying G$ for exact G$ amount.
 * @param {Web3} web3 Web3 instance.
 * @param {string} fromSymbol Symbol of the token that you want to use to buy G$.
 * @param {number | string} toAmount Amount of how much G$ want to receive.
 * @param {number} slippageTolerance Slippage tolerance while exchange tokens.
 * @returns {Promise<BuyInfo | null>}
 */
export async function getMetaReverse(
    web3: Web3,
    fromSymbol: string,
    toAmount: number | string,
    slippageTolerance = 0.5
): Promise<BuyInfo | null> {
    const chainId = await getChainId(web3)

    debugGroup(`Get meta ${toAmount} G$ to ${fromSymbol}`)

    const G$ = (await getToken(chainId, 'G$')) as Token

    if (!G$) {
        throw new UnsupportedChainId(chainId)
    }

    let FROM: Currency
    if (fromSymbol === 'ETH') {
        FROM = Ether.onChain(chainId)
    } else if (fromSymbol === 'FUSE') {
        FROM = FUSE
    } else {
        FROM = (await getToken(chainId, fromSymbol)) as Currency
    }

    if (!FROM) {
        throw new UnsupportedToken(fromSymbol)
    }

    let inputAmount: CurrencyAmount<Currency> = CurrencyAmount.fromRawAmount(G$, decimalToJSBI(toAmount, G$.decimals))

    let result
    if (chainId === SupportedChainId.FUSE) {
        result = await xToG$ExactOut(web3, FROM, inputAmount)
    } else {
        if (FROM.symbol === 'G$') {
            result = null
        } else if (FROM.symbol === 'cDAI') {
            const { amount } = await G$ToCDai(web3, inputAmount, ZERO_PERCENT)
            result = amount
        } else if (FROM.symbol === 'DAI') {
            const { amount } = await G$ToCDai(web3, inputAmount, ZERO_PERCENT)
            result = await cDaiToDai(web3, amount)
        } else {
            const { amount } = await G$ToCDai(web3, inputAmount, ZERO_PERCENT)
            const dai = await cDaiToDai(web3, amount)
            result = await xToDaiExactOut(web3, FROM, dai)
        }
    }

    debugGroupEnd(`Get meta ${toAmount} G$ to ${fromSymbol}`)

    if (!result) {
        return null
    }

    return getMeta(web3, fromSymbol, result.toExact(), slippageTolerance)
}

/**
 * Pick necessary date from meta swap.
 * @param {BuyInfo} meta Result of the method getMeta() execution.
 * @returns {input: string, minReturn: string, minDai: string}
 */
function prepareValues(meta: BuyInfo): { input: string; minReturn: string; minDai: string } {
    if (!meta.route.length) {
        throw new InsufficientLiquidity()
    }

    const input = meta.inputAmount.multiply(meta.inputAmount.decimalScale).toFixed(0)
    const minReturn = meta.minimumOutputAmount.multiply(meta.minimumOutputAmount.decimalScale).toFixed(0)
    const minDai = meta.DAIAmount ? meta.DAIAmount.multiply(meta.DAIAmount.decimalScale).toFixed(0) : '0'

    debug({
        input: meta.inputAmount.toSignificant(6),
        minReturn: meta.minimumOutputAmount.toSignificant(6),
        minDai: meta.DAIAmount ? meta.DAIAmount.toSignificant(6) : '0'
    })

    return { input, minReturn, minDai }
}

/**
 * Approve token usage.
 * @param {Web3} web3 Web3 instance.
 * @param {BuyInfo} meta Result of the method getMeta() execution.
 */
export async function approve(web3: Web3, meta: BuyInfo): Promise<void> {
    const chainId = await getChainId(web3)

    if (meta.trade && meta.trade.inputAmount.currency.isNative) {
        return
    } else if (chainId === SupportedChainId.FUSE) {
        await fuse.approveBuy(web3, meta.trade!)
    } else {
        const account = await getAccount(web3)
        const { input } = prepareValues(meta)
        const bigInput = BigNumber.from(input)

        const erc20 = ERC20Contract(web3, meta.route[0].address)

        const allowance = await erc20.methods
            .allowance(account, G$ContractAddresses(chainId, 'ExchangeHelper'))
            .call()
            .then((_: string) => BigNumber.from(_))

        if (bigInput.lte(allowance)) return

        await erc20.methods
            .approve(G$ContractAddresses(chainId, 'ExchangeHelper'), MaxUint256.toString())
            .send({ from: account })
    }
}

/**
 * Swap tokens.
 * @param {Web3} web3 Web3 instance.
 * @param {BuyInfo} meta Result of the method getMeta() execution.
 * @param {Function} onSent On sent event listener.
 */
export async function buy(web3: Web3, meta: BuyInfo, onSent?: (transactionHash: string, from: string) => void): Promise<any> {
    const chainId = await getChainId(web3)
    const account = await getAccount(web3)

    if (chainId === SupportedChainId.FUSE) {
        return fuse.swap(web3, meta.trade!, meta.slippageTolerance, onSent)
    } else {
        const contract = await exchangeHelperContract(web3)

        const { input, minReturn, minDai } = prepareValues(meta)

        let route: string[]
        // If ETH - change route a little bit to start from a zero address
        if (meta.trade && meta.trade.inputAmount.currency.isNative) {
            // Convert into an array of addresses
            route = [ethers.constants.AddressZero, ...meta.route.slice(1).map(token => token.address)]
        } else {
            // Otherwise keep as if, convert into an addresses
            route = meta.route.map(token => token.address)
        }

        const req = contract.methods
            .buy(
                route,
                BigNumber.from(input),
                BigNumber.from(minReturn),
                BigNumber.from(minDai),
                ethers.constants.AddressZero
            )
            .send({
                from: account,
                value: route[0] === ethers.constants.AddressZero ? input : undefined
            })
            
        if (onSent) req.on('transactionHash', (hash: string) => onSent(hash, account))
        return req
    }
}
