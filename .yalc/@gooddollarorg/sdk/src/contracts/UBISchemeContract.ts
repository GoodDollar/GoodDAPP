import Web3 from 'web3'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils'
import UBIScheme from '@gooddollar/goodprotocol/artifacts/contracts/ubi/UBIScheme.sol/UBIScheme.json'

import { G$ContractAddresses } from 'constants/addresses'
import { getChainId } from 'utils/web3'
import { SupportedChainId } from 'constants/chains'
import { UnsupportedChainId } from 'utils/errors'

/**
 * Returns instance of UBIScheme contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string?} address Deployed contract address in given chain ID.
 * @constructor
 */
export async function ubiSchemeContract(web3: Web3, address?: string): Promise<Contract> {
    const chainId = await getChainId(web3)
    if (chainId !== SupportedChainId.FUSE) {
        throw new UnsupportedChainId(chainId)
    }

    address = address ?? G$ContractAddresses(chainId, 'UBIScheme')

    return new web3.eth.Contract(UBIScheme.abi as AbiItem[], address)
}
