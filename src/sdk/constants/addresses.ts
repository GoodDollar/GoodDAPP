import { FACTORY_ADDRESS as V2_FACTORY_ADDRESS, INIT_CODE_HASH } from '@uniswap/v2-sdk'
import contractsAddresses, { ObjectLike } from '@gooddollar/goodprotocol/releases/deployment.json'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

export const getNetworkEnv = (): string => {
    return localStorage.getItem('GD_NETWORK') || process.env.REACT_APP_NETWORK || 'staging'
}

type AddressMap = { [chainId: number]: string }

/**
 * Fetch contract address from @gooddollar/goodprotocol npm package.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {string} name Contract name.
 * @see node_modules/@gooddollar/goodprotocol/releases/deployment.json
 */
export function G$ContractAddresses<T = ObjectLike>(chainId: SupportedChainId, name: string): T {
    let deploymentName: string
    const CURRENT_NETWORK = getNetworkEnv()
    switch (chainId) {
        case SupportedChainId.KOVAN:
            deploymentName = 'kovan-mainnet'
            break
        case SupportedChainId.MAINNET:
        case SupportedChainId.ROPSTEN:
            deploymentName = CURRENT_NETWORK + '-mainnet'
            break
        case SupportedChainId.FUSE:
            deploymentName = CURRENT_NETWORK
            break
    }

    if (!contractsAddresses[deploymentName]) {
      console.warn(`tokens: Unsupported chain ID ${deploymentName}`, CURRENT_NETWORK)
      deploymentName = deploymentName.includes('mainnet') ? CURRENT_NETWORK + '-mainnet' : CURRENT_NETWORK
    }
    if (!contractsAddresses[deploymentName][name]) {
      throw new Error(`Inappropriate contract name ${name} in ${deploymentName} ${chainId}`)
    }
    
    return (contractsAddresses[deploymentName][name] as unknown) as T
}

/* UNI tokens addresses. */
export const UNI_ADDRESS: AddressMap = constructSameAddressMap('0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984')

/* Uniswap's factory addresses per network. */
export const UNISWAP_FACTORY_ADDRESSES: AddressMap = {
    ...constructSameAddressMap(V2_FACTORY_ADDRESS),
    [SupportedChainId.FUSE]: '0x1998E4b0F1F922367d8Ec20600ea2b86df55f34E'
}

/* Uniswap's initialization hash codes for calculating pair addresses per network. */
export const UNISWAP_INIT_CODE_HASH: AddressMap = {
    ...constructSameAddressMap(INIT_CODE_HASH),
    [SupportedChainId.FUSE]: '0xe5f5532292e2e2a7aee3c2bb13e6d26dca6e8cc0a843ddd6f37c436c23cfab22'
}

export const UNISWAP_CONTRACT_ADDRESS: AddressMap = {
    [SupportedChainId.FUSE]: '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5'
}
