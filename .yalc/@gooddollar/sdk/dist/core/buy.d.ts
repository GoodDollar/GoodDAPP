import Web3 from 'web3';
import { Currency, CurrencyAmount, Fraction, Percent, Token, TradeType } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/v2-sdk';
export declare type BuyInfo = {
    inputAmount: CurrencyAmount<Currency>;
    outputAmount: CurrencyAmount<Currency>;
    minimumOutputAmount: CurrencyAmount<Currency>;
    DAIAmount: CurrencyAmount<Currency> | null;
    cDAIAmount: CurrencyAmount<Currency> | null;
    GDXAmount: CurrencyAmount<Currency> | Fraction;
    priceImpact: Fraction;
    slippageTolerance: Percent;
    liquidityFee: CurrencyAmount<Currency>;
    liquidityToken: Currency;
    route: Token[];
    trade: Trade<Currency, Currency, TradeType> | null;
};
declare type DAIResult = {
    amount: CurrencyAmount<Currency>;
    minAmount: CurrencyAmount<Currency>;
    route: Token[];
    trade: Trade<Currency, Currency, TradeType>;
};
declare type G$Result = Omit<DAIResult, 'route' | 'trade'>;
/**
 * Tries to convert token X into DAI. If it impossible - returns null.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} currency Token X currency amount instance.
 * @param {Percent} slippageTolerance Slippage tolerance.
 * @returns {DAIResult | null}
 */
export declare function xToDaiExactIn(web3: Web3, currency: CurrencyAmount<Currency>, slippageTolerance: Percent): Promise<DAIResult | null>;
/**
 * Tries to get amount of token X from DAI. If it impossible - returns null.
 * @param {Web3} web3 Web3 instance.
 * @param {Currency} currency Token X currency amount instance.
 * @param {CurrencyAmount<Currency>} DAI Token DAI currency amount instance.
 * @returns {DAIResult | null}
 */
export declare function xToDaiExactOut(web3: Web3, currency: Currency, DAI: CurrencyAmount<Currency>): Promise<CurrencyAmount<Currency> | null>;
/**
 * Tries to convert token X into G$. If it impossible - returns null.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} currency Token X currency amount instance.
 * @param {Percent} slippageTolerance Slippage tolerance.
 * @returns {DAIResult | null}
 */
export declare function xToG$ExactIn(web3: Web3, currency: CurrencyAmount<Currency>, slippageTolerance: Percent): Promise<DAIResult | null>;
/**
 * Tries to get amount of token X from G$. If it impossible - returns null.
 * @param {Web3} web3 Web3 instance.
 * @param {Currency} currency Token X currency amount instance.
 * @param {CurrencyAmount<Currency>} G$ Token G$ currency amount instance.
 * @returns {DAIResult | null}
 */
export declare function xToG$ExactOut(web3: Web3, currency: Currency, G$: CurrencyAmount<Currency>): Promise<CurrencyAmount<Currency> | null>;
/**
 * Tries to convert token DAI into cDAI.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} currency DAI token amount.
 * @returns {CurrencyAmount<Currency>}
 * @throws {UnexpectedToken} If currency not DAI.
 */
export declare function daiToCDai(web3: Web3, currency: CurrencyAmount<Currency>): Promise<CurrencyAmount<Currency>>;
/**
 * Tries to convert token cDAI into G$.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount<Currency>} currency CDAI token amount.
 * @param {Percent} slippageTolerance Slippage tolerance.
 * @returns {G$Result}
 * @throws {UnexpectedToken} If currency not cDAI.
 */
export declare function cDaiToG$(web3: Web3, currency: CurrencyAmount<Currency>, slippageTolerance: Percent): Promise<G$Result>;
/**
 * Returns trade information for buying G$.
 * @param {Web3} web3 Web3 instance.
 * @param {string} fromSymbol Symbol of the token that you want to use to buy G$.
 * @param {number | string} amount Amount of given currency.
 * @param {number} slippageTolerance Slippage tolerance while exchange tokens.
 * @returns {Promise<BuyInfo | null>}
 */
export declare function getMeta(web3: Web3, fromSymbol: string, amount: number | string, slippageTolerance?: number): Promise<BuyInfo | null>;
/**
 * Returns trade information for buying G$ for exact G$ amount.
 * @param {Web3} web3 Web3 instance.
 * @param {string} fromSymbol Symbol of the token that you want to use to buy G$.
 * @param {number | string} toAmount Amount of how much G$ want to receive.
 * @param {number} slippageTolerance Slippage tolerance while exchange tokens.
 * @returns {Promise<BuyInfo | null>}
 */
export declare function getMetaReverse(web3: Web3, fromSymbol: string, toAmount: number | string, slippageTolerance?: number): Promise<BuyInfo | null>;
/**
 * Approve token usage.
 * @param {Web3} web3 Web3 instance.
 * @param {BuyInfo} meta Result of the method getMeta() execution.
 */
export declare function approve(web3: Web3, meta: BuyInfo): Promise<void>;
/**
 * Swap tokens.
 * @param {Web3} web3 Web3 instance.
 * @param {BuyInfo} meta Result of the method getMeta() execution.
 * @param {Function} onSent On sent event listener.
 */
export declare function buy(web3: Web3, meta: BuyInfo, onSent?: (transactionHash: string, from: string) => void): Promise<any>;
export {};
//# sourceMappingURL=buy.d.ts.map