import { Trade } from '@uniswap/v2-sdk';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
/**
 * Returns whether tradeB is better than tradeA by at least a threshold percentage amount.
 * @param {Trade} tradeA Trade A.
 * @param {Trade} tradeB Trade B.
 * @param {Percent=ZERO_PERCENT} minimumDelta Minimum delta between trade A and trade B.
 * @returns {boolean | undefined}
 * @throws {Error} If tries to compare incomparable trades.
 */
export declare function isTradeBetter(tradeA: Trade<Currency, Currency, TradeType> | undefined | null, tradeB: Trade<Currency, Currency, TradeType> | undefined | null, minimumDelta?: Percent): boolean | undefined;
//# sourceMappingURL=isTradeBetter.d.ts.map