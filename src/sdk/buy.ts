import Web3 from 'web3'
import { BigNumber, ethers } from 'ethers'
import { Currency, CurrencyAmount, Fraction, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { Trade } from '@uniswap/v2-sdk'

import { getToken } from './methods/tokenLists'
import { decimalPercentToPercent, decimalToJSBI } from './utils/converter'
import { CDAI, WETH9_EXTENDED } from './constants/tokens'
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
import { EXCHANGE_HELPER_ADDRESS } from './constants/addresses'
import { computeRealizedLPFeePercent } from './utils/prices'
import { SupportedChainId } from './constants/chains'
import { v2TradeExactOut } from './methods/v2TradeExactOut'
import { cDaiToDai, G$ToCDai } from './sell'

export type BuyInfo = {
    inputAmount: CurrencyAmount<Currency>
    outputAmount: CurrencyAmount<Currency>
    minimumOutputAmount: CurrencyAmount<Currency>

    DAIAmount: CurrencyAmount<Currency> | null
    cDAIAmount: CurrencyAmount<Currency> | null
    GDXAmount: CurrencyAmount<Currency> | Fraction

    priceImpact: Fraction
    slippageTolerance: Percent

    liquidityFee: Fraction
    liquidityToken: Currency

    route: Token[]
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
 * Tries to convert token cDAI into G$.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} cDAI CDAI token amount.
 * @param {CurrencyAmount<Currency>} G$ G$ token amount.
 * @returns {Promise<Fraction>}
 */
async function getPriceImpact(
    web3: Web3,
    cDAI: CurrencyAmount<Currency>,
    G$: CurrencyAmount<Currency>
): Promise<Fraction> {
    const { cDAI: price } = await g$Price(await getChainId(web3))

    const priceImpact = new Fraction(1).subtract(G$.divide(cDAI.divide(price)))
    debug('Price impact', priceImpact.toSignificant(6))

    return priceImpact
}

/**
 * Calculates liquidity fee.
 * @param {Trade<Currency, Currency, TradeType>} trade Currency amount.
 * @returns {Fraction}
 */
function getLiquidityFee(trade: Trade<Currency, Currency, TradeType>): Fraction {
    const realizedLpFeePercent = computeRealizedLPFeePercent(trade)

    debug('Liquidity fee', realizedLpFeePercent.toSignificant(6))

    return realizedLpFeePercent
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
    slippageTolerance: number = 0.5
): Promise<BuyInfo | null> {
    const chainId = await getChainId(web3)

    if (fromSymbol === 'ETH' || fromSymbol === 'FUSE') {
        fromSymbol = 'WETH9'
    }

    debugGroup(`Get meta ${amount} ${fromSymbol} to G$`)

    const G$ = (await getToken(chainId, 'G$')) as Token

    if (!G$) {
        throw new UnsupportedChainId(chainId)
    }

    const FROM = fromSymbol === 'WETH9' ? WETH9_EXTENDED[chainId] : await getToken(chainId, fromSymbol)

    if (!FROM) {
        throw new UnsupportedToken(fromSymbol)
    }

    const DAI = (await getToken(chainId, 'DAI')) as Token

    let DAIAmount: CurrencyAmount<Currency> | null = null
    let cDAIAmount: CurrencyAmount<Currency> | null = null

    let inputAmount: CurrencyAmount<Currency>
    let outputAmount: CurrencyAmount<Currency>
    let minimumOutputAmount: CurrencyAmount<Currency>
    let route: Token[]

    let liquidityFee = new Fraction(0)
    let priceImpact = new Fraction(0)

    const slippageTolerancePercent = decimalPercentToPercent(slippageTolerance)

    if (chainId === SupportedChainId.FUSE) {
        inputAmount = CurrencyAmount.fromRawAmount(FROM, decimalToJSBI(amount, FROM.decimals))

        const trade = await xToG$ExactIn(web3, inputAmount, slippageTolerancePercent)

        if (!trade) {
            return null
        }

        route = trade.route

        liquidityFee = getLiquidityFee(trade.trade)

        outputAmount = trade.amount
        minimumOutputAmount = trade.minAmount

        priceImpact = trade.trade.priceImpact
    } else {
        if (FROM.symbol === 'G$') {
            return null
        } else if (FROM.symbol === 'cDAI') {
            const cDAI = CDAI[chainId]
            route = [cDAI]

            inputAmount = CurrencyAmount.fromRawAmount(cDAI, decimalToJSBI(amount, cDAI.decimals))

            DAIAmount = CurrencyAmount.fromRawAmount(DAI, 0)
            cDAIAmount = inputAmount
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
            cDAIAmount = await daiToCDai(web3, DAIAmount)
            ;({ amount: outputAmount, minAmount: minimumOutputAmount } = await cDaiToG$(
                web3,
                cDAIAmount,
                slippageTolerancePercent
            ))
        } else {
            inputAmount = CurrencyAmount.fromRawAmount(FROM, decimalToJSBI(amount, FROM.decimals))

            const trade = await xToDaiExactIn(web3, inputAmount, slippageTolerancePercent)

            if (!trade) {
                return null
            }

            DAIAmount = trade.minAmount
            cDAIAmount = await daiToCDai(web3, DAIAmount)
            route = trade.route

            liquidityFee = getLiquidityFee(trade.trade)
            ;[{ amount: outputAmount }, { minAmount: minimumOutputAmount }] = await Promise.all([
                daiToCDai(web3, trade.amount).then(cDAI => cDaiToG$(web3, cDAI, ZERO_PERCENT)),
                cDaiToG$(web3, cDAIAmount, ZERO_PERCENT)
            ])
        }

        priceImpact = await getPriceImpact(web3, cDAIAmount, minimumOutputAmount)
    }

    debugGroupEnd(`Get meta ${amount} ${fromSymbol} to G$`)

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

        route
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
    slippageTolerance: number = 0.5
): Promise<BuyInfo | null> {
    const chainId = await getChainId(web3)

    if (fromSymbol === 'ETH' || fromSymbol === 'FUSE') {
        fromSymbol = 'WETH9'
    }

    debugGroup(`Get meta ${toAmount} G$ to ${fromSymbol}`)

    const G$ = (await getToken(chainId, 'G$')) as Token

    if (!G$) {
        throw new UnsupportedChainId(chainId)
    }

    const FROM = fromSymbol === 'WETH9' ? WETH9_EXTENDED[chainId] : await getToken(chainId, fromSymbol)

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
    const account = await getAccount(web3)

    const { input } = prepareValues(meta)

    // If ETH - ignore method
    if (meta.route[0].symbol === 'WETH9') {
        return
    } else {
        // Approve ERC20 token to exchange
        await ERC20Contract(web3, meta.route[0].address)
            .methods.approve(EXCHANGE_HELPER_ADDRESS[chainId], input)
            .send({ from: account })
    }
}

/**
 * Swap tokens.
 * @param {Web3} web3 Web3 instance.
 * @param {BuyInfo} meta Result of the method getMeta() execution.
 */
export async function buy(web3: Web3, meta: BuyInfo): Promise<any> {
    const account = await getAccount(web3)

    const contract = await exchangeHelperContract(web3)

    const { input, minReturn, minDai } = prepareValues(meta)

    let route: string[]
    // If ETH - change route a little bit to start from a zero address
    if (meta.route[0].symbol === 'WETH9') {
        // Convert into an array of addresses
        route = [ethers.constants.AddressZero, ...meta.route.slice(1).map(token => token.address)]
    } else {
        // Otherwise keep as if, convert into an addresses
        route = meta.route.map(token => token.address)
    }

    return contract.methods
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
}
