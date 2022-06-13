import { Currency } from "@uniswap/sdk-core";
import { Pair } from "@uniswap/v2-sdk";
import { SupportedChainId } from "constants/chains";
/**
 * Calculates possible pairs in given chain that could be used to build exchange path.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Currency} currencyA Currency from.
 * @param {Currency} currencyB Currency to.
 * @returns {Pair[]} List of pairs.
 */
export declare const allCommonPairs: ((chainId: SupportedChainId, currencyA?: Currency, currencyB?: Currency) => Promise<Pair[]>) & import("lodash").MemoizedFunction;
//# sourceMappingURL=allCommonPairs.d.ts.map