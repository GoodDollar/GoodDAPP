import { Contract, ContractInterface } from 'ethers';
import { SupportedChainId } from 'constants/chains';
import Web3 from 'web3';
/**
 * Returns a contract in given chain ID.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {string} address Address of the deployed contract.
 * @param {ContractInterface} abi ABI for a contract.
 * @returns {Contract}
 */
export declare function getContract(chainId: SupportedChainId, addressOrName: string, abi: ContractInterface, web3?: Web3): Contract;
//# sourceMappingURL=getContract.d.ts.map