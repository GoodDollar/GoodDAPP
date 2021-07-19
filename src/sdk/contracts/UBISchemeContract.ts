import Web3 from "web3";
import { AbiItem } from "web3-utils";
import UBIScheme from "@gooddollar/goodprotocol/artifacts/contracts/ubi/UBIScheme.sol/UBIScheme.json";

import { G$ContractAddresses } from "../constants/addresses";
import { getChainId } from "../utils/web3";

/**
 * Returns instance of UBIScheme contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 * @todo UBIScheme was not presented in Kovan network
 */
export async function ubiSchemeContract(web3: Web3, address?: string) {
  address = address ?? G$ContractAddresses(await getChainId(web3), 'UBIScheme')

  return new web3.eth.Contract(UBIScheme.abi as AbiItem[], address)
}
