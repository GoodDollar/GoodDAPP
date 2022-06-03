export {};
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import Fraction from 'entities/Fraction';
declare module '@ethersproject/bignumber' {
    interface BigNumber {
        muldiv(multiplier: BigNumberish, divisor: BigNumberish): BigNumber;
        toFixed(decimals: BigNumberish): string;
        toFraction(decimals: BigNumberish, base: BigNumberish): Fraction;
    }
}
declare global {
    export interface String {
        toBigNumber(decimals: number): BigNumber;
    }
}
//# sourceMappingURL=bootstrap.d.ts.map