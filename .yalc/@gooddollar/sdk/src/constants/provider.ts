import { BaseProvider, Web3Provider, JsonRpcProvider } from '@ethersproject/providers'

import { SupportedChainId } from './chains'
import { getRpc } from 'hooks/useEnvWeb3'
import Web3 from 'web3'
/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export function getProvider(chainId: SupportedChainId, web3?: Web3): BaseProvider {
  const rpcUrl = getRpc(chainId)
  if (chainId === SupportedChainId.FUSE) {
      return new JsonRpcProvider(rpcUrl)
  }
  return web3
      ? new Web3Provider(web3.currentProvider as any)
      : new JsonRpcProvider(rpcUrl)
}
