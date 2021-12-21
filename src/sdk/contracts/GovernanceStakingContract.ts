import Web3 from 'web3'
import { Eth } from 'web3-eth'

import { AbiItem } from 'web3-utils'
import GovernanceStaking from '@gooddollar/goodprotocol/artifacts/contracts/governance/GovarnanceStaking.sol/GovernanceStaking.json'

import { G$ContractAddresses } from '../constants/addresses'
import { getChainId } from '../utils/web3'
import { SupportedChainId } from '../constants/chains'
import { UnsupportedChainId } from '../utils/errors'
import { Ether } from '@uniswap/sdk-core'

/**
 * Returns instance of UBIScheme contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
export function governanceStakingContract(web3: Web3, address?: string) {
    address = address ?? G$ContractAddresses(SupportedChainId.FUSE, 'GovernanceStaking')

    return new web3.eth.Contract(GovernanceStaking.abi as AbiItem[], address)
}
