import { Token } from "@uniswap/sdk-core";
import { SupportedChainId } from "constants/chains";
/**
 * Compute pair address between tokens for uniswap.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Token} tokenA Token A.
 * @param {Token} tokenB Token B.
 * @returns {string} Pair address.
 */
export declare const computePairAddress: ((chainId: SupportedChainId, tokenA: Token, tokenB: Token) => string) & import("lodash").MemoizedFunction;
//# sourceMappingURL=computePairAddress.d.ts.map