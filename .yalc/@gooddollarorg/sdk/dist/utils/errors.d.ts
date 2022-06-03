export declare class UnsupportedChainId extends Error {
    constructor(chainId?: number | string);
}
export declare class InvalidChainId extends Error {
    constructor(expectedChainId: number | string);
}
export declare class UnsupportedToken extends Error {
    constructor(token?: string);
}
export declare class UnexpectedToken extends Error {
    constructor(token?: string);
}
export declare class InsufficientLiquidity extends Error {
    constructor();
}
//# sourceMappingURL=errors.d.ts.map