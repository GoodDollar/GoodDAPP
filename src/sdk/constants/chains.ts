/* List of supported chains for this application. */
export enum SupportedChainId {
  MAINNET = 1,
  KOVAN = 42,
  FUSE = 122,
}

/* List of supported chain's names. */
export const NETWORK_LABELS: { [chainId in SupportedChainId | number]: string } = {
  [SupportedChainId.MAINNET]: 'mainnet',
  [SupportedChainId.KOVAN]: 'kovan',
  [SupportedChainId.FUSE]: 'fuse',
}