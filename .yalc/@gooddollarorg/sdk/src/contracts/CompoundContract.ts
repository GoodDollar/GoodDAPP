import Web3 from "web3"
import { Contract } from "web3-eth-contract"
import { AbiItem } from "web3-utils"

import CDAIAbi from "abi/CDAI.json"

/**
 * Returns instance of compound contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export async function compoundContract(web3: Web3, address: string): Promise<Contract> {
  return new web3.eth.Contract(CDAIAbi as AbiItem[], address)
}
