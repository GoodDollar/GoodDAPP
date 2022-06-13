import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import { AbiItem } from "web3-utils"
import ExchangeHelper from "@gooddollar/goodprotocol/artifacts/contracts/reserve/ExchangeHelper.sol/ExchangeHelper.json"

import { G$ContractAddresses } from "constants/addresses";
import { getChainId } from "utils/web3";

/**
 * Returns instance of ExchangeHelper contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
export async function exchangeHelperContract(web3: Web3, address?: string): Promise<Contract> {
  address = address ?? G$ContractAddresses(await getChainId(web3), 'ExchangeHelper')

  return new web3.eth.Contract(ExchangeHelper.abi as AbiItem[], address)
}
