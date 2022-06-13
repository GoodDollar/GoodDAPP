import { Fraction } from '@uniswap/sdk-core';
declare type StakingAPY = {
    supplyAPY: Fraction;
    incentiveAPY: Fraction;
};
/**
 * Returns COMPOUND staking meta intormation from GraphQL request.
 * @param {number} chainId Chain ID.
 * @param {string} tokenAddress Token address.
 * @returns {Fraction}
 * @throws {UnsupportedChainId}
 */
export declare const compoundStaking: ((chainId: number, tokenAddress: string) => Promise<StakingAPY>) & import("lodash").MemoizedFunction;
export {};
//# sourceMappingURL=rest.d.ts.map