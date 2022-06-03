import Web3 from "web3"
import { Contract } from 'web3-eth-contract'
import { AbiItem } from "web3-utils"
import StakersDistribution
  from "@gooddollar/goodprotocol/artifacts/contracts/governance/StakersDistribution.sol/StakersDistribution.json"

import { G$ContractAddresses } from "constants/addresses"
import { getChainId } from "utils/web3"

/**
 * Returns instance of StakersDistribution contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
export async function stakersDistributionContract(web3: Web3, address?: string): Promise<Contract> {
  address = address ?? G$ContractAddresses(await getChainId(web3), 'StakersDistribution')

  return new web3.eth.Contract(StakersDistribution.abi as AbiItem[], address)
}
