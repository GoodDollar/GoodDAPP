import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { LIQUIDITY_PROTOCOL } from 'constants/protocols';
/**
 * Returns instance of SimpleStaking contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export declare function simpleStakingContractV2(web3: Web3, address: string): Contract;
export declare type simpleStakingAddresses = [
    {
        release: string;
        addresses: string[];
    }
];
/**
 * Returns all available addresses for simpleStaking
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<simpleStakingAddresses>}
 */
export declare function getSimpleStakingContractAddressesV3(web3: Web3): Promise<simpleStakingAddresses>;
/**
 * Returns usd Oracle address.
 * @param {Web3} web3 Web3 instance.
 * @returns {string}
 */
export declare function getUsdOracle(protocol: LIQUIDITY_PROTOCOL, web3: Web3): string;
//# sourceMappingURL=SimpleStakingContractV3.d.ts.map