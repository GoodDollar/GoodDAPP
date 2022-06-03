import Web3 from 'web3';
import { Currency, Price } from '@uniswap/sdk-core';
import { DAI } from 'constants/tokens';
/**
 * Calculates cDAI -> DAI ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Fraction} Ratio.
 */
export declare const g$ReservePrice: ((web3: Web3, chainId: number) => Promise<{
    DAI: Price<Currency, Currency>;
    cDAI: Price<Currency, Currency>;
}>) & import("lodash").MemoizedFunction;
//# sourceMappingURL=g$price.d.ts.map