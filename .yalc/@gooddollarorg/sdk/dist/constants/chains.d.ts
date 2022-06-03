export declare enum SupportedChainId {
    MAINNET = 1,
    KOVAN = 42,
    FUSE = 122,
    ROPSTEN = 3
}
export declare enum DAO_NETWORK {
    MAINNET = "mainnet",
    FUSE = "fuse"
}
export declare enum ChainIdHexes {
    MAINNET = "0x1",
    FUSE = "0x7a"
}
export declare const NETWORK_LABELS: {
    [chainId in SupportedChainId | number]: string;
};
export declare const ONBOARD_CHAINID: {
    [chainId in ChainIdHexes | string]: number;
};
export declare const ONBOARD_DEFAULT_TOKEN: {
    [chainId in SupportedChainId | number]: string;
};
export declare const stakesSupportedAt: Array<number | undefined>;
export declare const portfolioSupportedAt: Array<number | undefined>;
//# sourceMappingURL=chains.d.ts.map