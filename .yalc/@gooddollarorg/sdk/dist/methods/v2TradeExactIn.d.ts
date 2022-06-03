import { Currency, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";
import { SupportedChainId } from "constants/chains";
/**
 * Returns the best trade for the token in to the exact amount of token in.
 * @param {CurrencyAmount} currencyAmountIn Currency exchange from
 * @param {Currency} currencyOut Currency exchange to.
 * @param {number=3} maxHops Maximum hops to find the best exchange route.
 * @param {SupportedChainId} chainId Chain ID.
 * @returns {Promise<Trade>}
 */
export declare function v2TradeExactIn(currencyAmountIn?: CurrencyAmount<Currency>, currencyOut?: Currency, { maxHops, chainId }?: {
    maxHops?: number | undefined;
    chainId?: SupportedChainId | undefined;
}): Promise<Trade<Currency, Currency, TradeType.EXACT_INPUT> | null>;
//# sourceMappingURL=v2TradeExactIn.d.ts.map