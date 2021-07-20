import { Contract, ContractInterface, ethers } from "ethers";

import { getProvider } from "../constants/provider";
import { SupportedChainId } from "../constants/chains";

/**
 * Returns a contract in given chain ID.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {string} address Address of the deployed contract.
 * @param {ContractInterface} abi ABI for a contract.
 * @returns {Contract}
 */
export function getContract(chainId: SupportedChainId, address: string, abi: ContractInterface): Contract {
  return new ethers.Contract(address, abi, getProvider(chainId))
}
