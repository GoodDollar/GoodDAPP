/* List of supported chains for this application. */
export enum SupportedChainId {
    MAINNET = 1,
    KOVAN = 42,
    FUSE = 122,
    ROPSTEN = 3
}

/* List of supported chain's names. */
export const NETWORK_LABELS: { [chainId in SupportedChainId | number]: string } = {
    [SupportedChainId.MAINNET]: 'mainnet',
    [SupportedChainId.KOVAN]: 'kovan',
    [SupportedChainId.FUSE]: 'fuse',
    [SupportedChainId.ROPSTEN]: 'ropsten'
}

export const stakesSupportedAt: Array<number | undefined> = [SupportedChainId.KOVAN]
export const portfolioSupportedAt: Array<number | undefined> = [SupportedChainId.KOVAN]
