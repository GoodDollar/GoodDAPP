export { getNetworkEnv } from './addresses'
export { LIQUIDITY_PROTOCOL} from './protocols'
export { DAO_NETWORK, portfolioSupportedAt, SupportedChainId } from './chains'
export type { TransactionDetails } from './transactions'

export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export enum AdditionalChainId {
  FUSE = 122,
  //KOVAN = 42
}
