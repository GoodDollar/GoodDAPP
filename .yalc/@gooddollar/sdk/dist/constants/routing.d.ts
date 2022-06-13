import { Token } from '@uniswap/sdk-core';
declare type ChainTokenList = {
    readonly [chainId: number]: Token[];
};
export declare const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList;
export declare const ADDITIONAL_BASES: {
    [chainId: number]: {
        [tokenAddress: string]: Token[];
    };
};
export declare const CUSTOM_BASES: {
    [chainId: number]: {
        [tokenAddress: string]: Token[];
    };
};
export {};
//# sourceMappingURL=routing.d.ts.map