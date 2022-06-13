import { SupportedChainId } from 'constants/chains'

/* Without FUSE network. */
const NETWORKS = [SupportedChainId.MAINNET, SupportedChainId.KOVAN]

/* Constructs addressed map for all chains in NETWORKS constant with the same address. */
export function constructSameAddressMap<T extends string>(address: T, additionalNetworks: SupportedChainId[] = []): { [chainId: number]: T } {
  return NETWORKS.concat(additionalNetworks).reduce<{ [chainId: number]: T }>((memo, chainId) => {
    memo[chainId] = address
    return memo
  }, {})
}