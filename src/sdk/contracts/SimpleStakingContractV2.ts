import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import SimpleStakingV2 from '@gooddollar/goodprotocol/artifacts/contracts/staking/SimpleStakingV2.sol/SimpleStakingV2.json'
import contractsAddresses from '@gooddollar/goodprotocol/releases/deploy-settings.json'
import { SupportedChainId } from '../constants/chains'

import { G$ContractAddresses, getNetworkEnv } from '../constants/addresses'
import { getChainId } from '../utils/web3'
import { LIQUIDITY_PROTOCOL } from 'sdk/constants/protocols'


/**
 * Returns instance of SimpleStaking contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Deployed contract address in given chain ID.
 * @constructor
 */
export function simpleStakingContractV2(web3: Web3, address: string) {
    return new web3.eth.Contract(SimpleStakingV2.abi as AbiItem[], address)
}

/**
 * Returns staking all available addresses.
 * @param {Web3} web3 Web3 instance.
 * @returns {Promise<string[]>}
 */
export async function getSimpleStakingContractAddressesV2(web3: Web3): Promise<string[]> {
    const chainId = await getChainId(web3) // doesn't return proper chainId?
    const _addresses = G$ContractAddresses<Array<string[] | string>>(chainId, 'StakingContractsV2')

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

/**
 * Returns usd Oracle address.
 * @param {Web3} web3 Web3 instance.
 * @returns {string}
 */

// TODO: Add function description
export function getUsdOracle(protocol: LIQUIDITY_PROTOCOL, web3: Web3) {
  let usdOracle: string, deploymentName: string

  let chainId = web3.givenProvider.networkVersion as SupportedChainId
  const CURRENT_NETWORK = getNetworkEnv()

  deploymentName = 'production-mainnet'
  if (chainId == SupportedChainId.MAINNET || chainId == SupportedChainId.ROPSTEN) {
    deploymentName = `${CURRENT_NETWORK}-mainnet`    
  } else if (chainId == SupportedChainId.KOVAN) {
      deploymentName = 'kovan-mainnet'
  }
  
  if (protocol === LIQUIDITY_PROTOCOL.COMPOUND){
    usdOracle = contractsAddresses[deploymentName].compound.daiUsdOracle
  } else {
    usdOracle = contractsAddresses[deploymentName].aave.usdcUsdOracle
  }

  return usdOracle
}
