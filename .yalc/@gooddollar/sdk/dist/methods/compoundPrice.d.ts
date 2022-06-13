import Web3 from "web3";
import { Fraction } from "@uniswap/sdk-core";
/**
 * Calculates compound -> underlying ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @param {string} address Chain ID for cache.
 * @returns {Fraction} Ratio.
 */
export declare const compoundPrice: ((web3: Web3, address: string, chainId: number) => Promise<Fraction>) & import("lodash").MemoizedFunction;
//# sourceMappingURL=compoundPrice.d.ts.map