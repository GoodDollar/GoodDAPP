import { FACTORY_ADDRESS as V2_FACTORY_ADDRESS, INIT_CODE_HASH } from '@uniswap/v2-sdk'
import contractsAddresses, { ObjectLike } from '@gooddollar/goodprotocol/releases/deployment.json'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

export const getNetworkEnv = () => {
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
    [SupportedChainId.FUSE]: '0x1d1f1A7280D67246665Bb196F38553b469294f3a'
}

/* Uniswap's initialization hash codes for calculating pair addresses per network. */
export const UNISWAP_INIT_CODE_HASH: AddressMap = {
    ...constructSameAddressMap(INIT_CODE_HASH),
    [SupportedChainId.FUSE]: '0x04990f130515035f22e76663517440918b83941b25a4ec04ecdf4b2898e846aa'
}

export const UNISWAP_CONTRACT_ADDRESS: AddressMap = {
    [SupportedChainId.FUSE]: '0xFB76e9E7d88E308aB530330eD90e84a952570319'
}
