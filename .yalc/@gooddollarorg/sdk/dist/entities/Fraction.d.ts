export {};
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { Fraction as SDKFraction } from '@sushiswap/sdk';
declare class Fraction {
    static BASE: BigNumber;
    static NAN: Fraction;
    static ZERO: Fraction;
    static convert(sdk: SDKFraction): Fraction;
    static from(numerator: BigNumberish, denominator: BigNumberish): Fraction;
    static parse(value: string): Fraction;
    numerator: BigNumber;
    denominator: BigNumber;
    private constructor();
    isZero(): boolean;
    isNaN(): boolean;
    eq(fraction: Fraction): boolean;
    gt(fraction: Fraction): boolean;
    lt(fraction: Fraction): boolean;
    toString(maxFractions?: number): string;
    apply(value: BigNumberish): BigNumber;
}
export default Fraction;
//# sourceMappingURL=Fraction.d.ts.map