import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import Web3 from 'web3'

import { SupportedChainId } from '../constants/chains'
import { getContract } from '../utils/getContract'

/**
 * Returns instance of GoodMarket contract.
 * @param {SupportedChainId} chainId Given chain ID.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export function PairContract(chainId: SupportedChainId, address: string) {
    return getContract(chainId, address, IUniswapV2PairABI)
}
