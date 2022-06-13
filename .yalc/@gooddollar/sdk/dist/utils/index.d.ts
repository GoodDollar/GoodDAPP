import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
export declare const formatFromBalance: (value: BigNumber | undefined, decimals?: number) => string;
export declare const formatToBalance: (value: string | undefined, decimals?: number) => {
    value: BigNumber;
    decimals: number;
};
export declare function isWETH(value: any): string;
export declare const formatBalance: (value: BigNumberish, decimals?: number, maxFraction?: number) => string;
export declare const parseBalance: (value: string, decimals?: number) => BigNumber;
export declare const isEmptyValue: (text: string) => boolean;
export declare function isAddress(value: any): string | false;
export declare function isAddressString(value: any): string;
//# sourceMappingURL=index.d.ts.map