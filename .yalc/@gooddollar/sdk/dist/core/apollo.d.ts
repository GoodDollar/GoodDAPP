export {};
import { ApolloClient } from '@apollo/client';
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types';
import { Fraction } from '@uniswap/sdk-core';
import { Token } from '@uniswap/sdk-core';
/**
 * Returns Apollo client to make GraphQL requests.
 * @param {string} uri Client URI.
 * @returns {ApolloClient}
 */
export declare function getClient(uri: string): ApolloClient<NormalizedCacheObject>;
/**
 * Returns G$ price from GraphQL request.
 * @param {number} chainId Chain ID.
 * @returns {Fraction}
 * @throws {UnsupportedChainId}
 */
export declare const g$Price: (() => Promise<{
    DAI: Fraction;
    cDAI: Fraction;
}>) & import("lodash").MemoizedFunction;
declare type StakingAPY = {
    supplyAPY: Fraction;
    incentiveAPY: Fraction;
};
/**
 * Returns AAVE staking meta intormation from GraphQL request.
 * @param {number} chainId Chain ID.
 * @param {string} tokenSymbol Token symbol.
 * @returns {Fraction}
 * @throws {UnsupportedChainId}
 */
export declare const aaveStaking: ((chainId: number, token: Token) => Promise<StakingAPY>) & import("lodash").MemoizedFunction;
//# sourceMappingURL=apollo.d.ts.map