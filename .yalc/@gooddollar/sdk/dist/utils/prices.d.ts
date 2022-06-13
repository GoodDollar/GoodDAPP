import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade } from '@uniswap/v2-sdk';
/**
 * Computes realized lp fee as a percent.
 * @param {Trade} trade Givem trade.
 * @returns {Percent}
 */
export declare function computeRealizedLPFeePercent(trade: Trade<Currency, Currency, TradeType>): Percent;
//# sourceMappingURL=prices.d.ts.map