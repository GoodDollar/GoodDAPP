import Web3 from "web3"
import { AbiItem } from "web3-utils"
import { Contract } from "web3-eth-contract"

import CDAIAbi from "abi/CDAI.json"
import { getChainId } from "utils/web3"
import { G$ContractAddresses } from "constants/addresses"

/**
 * Returns instance of CDAI contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
export async function cDaiContract(web3: Web3, address?: string):Promise<Contract> {
  address = address ?? G$ContractAddresses(await getChainId(web3), 'cDAI')

  return new web3.eth.Contract(CDAIAbi as AbiItem[], address)
}
