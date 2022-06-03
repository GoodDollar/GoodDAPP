import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
export interface BigNumberMath {
    min(...values: BigNumberish[]): BigNumber;
    max(...values: BigNumberish[]): BigNumber;
}
export declare class BigNumberMath implements BigNumberMath {
    static min(...values: BigNumberish[]): BigNumber;
    static max(...values: BigNumberish[]): BigNumber;
}
export default BigNumberMath;
//# sourceMappingURL=BigNumberMath.d.ts.map