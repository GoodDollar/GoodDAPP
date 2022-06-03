import { Currency, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";
import { SupportedChainId } from "constants/chains";
/**
 * Returns the best trade for the token in to the exact amount of token out.
 * @param {Currency} currencyIn Currency exchange to.
 * @param {CurrencyAmount} currencyAmountOut Currency exchange from
 * @param {number=3} maxHops Maximum hops to find the best exchange route.
 * @param {SupportedChainId} chainId Chain ID.
 * @returns {Promise<Trade>}
 */
export declare function v2TradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount<Currency>, { maxHops, chainId }?: {
    maxHops?: number | undefined;
    chainId?: SupportedChainId | undefined;
}): Promise<Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null>;
//# sourceMappingURL=v2TradeExactOut.d.ts.map