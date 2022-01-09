import { ethers } from 'ethers'
import { BaseProvider } from '@ethersproject/providers/src.ts/base-provider'
import { JsonRpcProvider } from '@ethersproject/providers/src.ts/json-rpc-provider'

import { NETWORK_LABELS, SupportedChainId } from './chains'
import { RPC } from '../hooks/useEnvWeb3'
import Web3 from 'web3'
/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export function getProvider(chainId: SupportedChainId, web3?: Web3): BaseProvider {
    if (chainId === SupportedChainId.FUSE) {
        return new ethers.providers.JsonRpcProvider('https://rpc.fuse.io/')
    }
    return web3
        ? new ethers.providers.Web3Provider(web3.currentProvider as any)
        : new ethers.providers.JsonRpcProvider(RPC[chainId])
}
