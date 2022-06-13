import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import ERC20 from '@gooddollar/goodprotocol/artifacts/contracts/Interfaces.sol/ERC20.json'

/**
 * Returns instance of ERC20 contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export function ERC20Contract(web3: Web3, address: string): any {
    return new web3.eth.Contract(ERC20.abi as AbiItem[], address)
}
