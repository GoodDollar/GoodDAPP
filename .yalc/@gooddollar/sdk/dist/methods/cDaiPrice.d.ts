import Web3 from "web3";
import { Fraction } from "@uniswap/sdk-core";
/**
 * Calculates cDAI -> DAI ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Fraction} Ratio.
 */
export declare const cDaiPrice: ((web3: Web3, chainId: number) => Promise<Fraction>) & import("lodash").MemoizedFunction;
//# sourceMappingURL=cDaiPrice.d.ts.map