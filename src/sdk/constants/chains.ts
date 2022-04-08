/* List of supported chains for this application. */
export enum SupportedChainId {
    MAINNET = 1,
    KOVAN = 42,
    FUSE = 122,
    ROPSTEN = 3
}

export enum DAO_NETWORK {
    MAINNET = 'mainnet',
    FUSE = 'fuse'
}

/* List of supported chain's names. */
export const NETWORK_LABELS: { [chainId in SupportedChainId | number]: string } = {
    [SupportedChainId.MAINNET]: 'mainnet',
    [SupportedChainId.KOVAN]: 'kovan',
    [SupportedChainId.FUSE]: 'fuse',
    [SupportedChainId.ROPSTEN]: 'ropsten'
}

export const stakesSupportedAt: Array<number | undefined> = [
    SupportedChainId.KOVAN,
    SupportedChainId.MAINNET,
    SupportedChainId.ROPSTEN
]
export const portfolioSupportedAt: Array<number | undefined> = [SupportedChainId.KOVAN]
