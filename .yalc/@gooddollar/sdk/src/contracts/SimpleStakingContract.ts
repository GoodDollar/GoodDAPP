import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import SimpleStaking from '@gooddollar/goodprotocol/artifacts/contracts/staking/SimpleStaking.sol/SimpleStaking.json'

import { G$ContractAddresses } from '../constants/addresses'
import { getChainId } from '../utils/web3'

/**
 * Returns instance of SimpleStaking contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export function simpleStakingContract(web3: Web3, address: string): Contract {
    return new web3.eth.Contract(SimpleStaking.abi as AbiItem[], address)
}

/**
 * Returns staking all available addresses.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<string[]>}
 */
export async function getSimpleStakingContractAddresses(web3: Web3): Promise<string[]> {
    const chainId = await getChainId(web3) // doesn't return correct chainId
    const _addresses = G$ContractAddresses<Array<string[] | string>>(chainId, 'StakingContracts')

    const addresses = []
    for (const rawAddress of _addresses) {
        if (Array.isArray(rawAddress)) {
            addresses.push(rawAddress[0])
        } else {
            addresses.push(rawAddress)
        }
    }

    return addresses
}
