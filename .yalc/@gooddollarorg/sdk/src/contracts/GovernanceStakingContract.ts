import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import GovernanceStaking from '@gooddollar/goodprotocol/artifacts/contracts/governance/GovernanceStaking.sol/GovernanceStaking.json'
import { G$ContractAddresses } from 'constants/addresses'
import { SupportedChainId } from 'constants/chains'
import { getNetworkEnv } from 'constants/'

/**
 * Returns instance of UBIScheme contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
export function governanceStakingContract(web3: Web3, address?: string): Contract {
    address = address ?? G$ContractAddresses(SupportedChainId.FUSE, 'GovernanceStakingV2')

    return new web3.eth.Contract(GovernanceStaking.abi as AbiItem[], address)
}

export async function getGovernanceStakingContracts():Promise<{address:string | null, release: string}[]> {
  const networkType = getNetworkEnv()

  const addressv1 = G$ContractAddresses<string>(SupportedChainId.FUSE, 'GovernanceStaking')
  let addressv2 = null
  if (networkType === "production") addressv2 = G$ContractAddresses<string>(SupportedChainId.FUSE, 'GovernanceStakingV2')

  return [
    {address: addressv1, release: 'v1'},
    {address: addressv2, release: 'v2'}
  ]
}


