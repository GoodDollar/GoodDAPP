import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
/**
 * Returns instance of SimpleStaking contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export declare function simpleStakingContract(web3: Web3, address: string): Contract;
/**
 * Returns staking all available addresses.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<string[]>}
 */
export declare function getSimpleStakingContractAddresses(web3: Web3): Promise<string[]>;
//# sourceMappingURL=SimpleStakingContract.d.ts.map