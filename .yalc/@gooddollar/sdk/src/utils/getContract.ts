import { Contract, ContractInterface, ethers } from 'ethers'

import { getProvider } from 'constants/provider'
import { SupportedChainId } from 'constants/chains'
import { G$ContractAddresses } from 'constants/addresses'
import Web3 from 'web3'

/**
 * Returns a contract in given chain ID.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {string} address Address of the deployed contract.
 * @param {ContractInterface} abi ABI for a contract.
 * @returns {Contract}
 */
export function getContract(
    chainId: SupportedChainId,
    addressOrName: string,
    abi: ContractInterface,
    web3?: Web3
): Contract {
    let address = addressOrName
    if (false === addressOrName.startsWith('0x')) address = G$ContractAddresses(chainId, addressOrName)
    return new ethers.Contract(address, abi, getProvider(chainId, web3))
}
