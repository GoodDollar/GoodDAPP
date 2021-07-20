import { FACTORY_ADDRESS as V2_FACTORY_ADDRESS, INIT_CODE_HASH } from '@uniswap/v2-sdk'
import contractsAddresses, { ObjectLike } from '@gooddollar/goodprotocol/releases/deployment.json'

import { constructSameAddressMap } from '../utils/constructSameAddressMap'
import { SupportedChainId } from './chains'

type AddressMap = { [chainId: number]: string }

/**
 * Fetch contract address from @gooddollar/goodprotocol npm package.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {string} name Contract name.
 * @see node_modules/@gooddollar/goodprotocol/releases/deployment.json
 */
export function G$ContractAddresses<T = ObjectLike>(chainId: SupportedChainId, name: string): T {
  let deploymentName: string

  switch (chainId) {
    case SupportedChainId.MAINNET:
      deploymentName = 'production';
      break;
    case SupportedChainId.KOVAN:
      deploymentName = 'kovan-mainnet';
      break;
    case SupportedChainId.FUSE:
      deploymentName = 'fuse';
      break;
  }

  if (!contractsAddresses[deploymentName]) {
    throw new Error('Unsupported chain ID')
  }

  if (!contractsAddresses[deploymentName][name]) {
    throw new Error(`Inappropriate contract name ${ name }`)
  }

  return contractsAddresses[deploymentName][name] as unknown as T
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

/* ContributionCalc contract address per network. */
export const CONTRIBUTION_CALC_ADDRESS: AddressMap = {
  [SupportedChainId.KOVAN]: '0xb8e03cE6bb337A1161ca6E53DE568efBe5650eaF',
}

/* ExchangeHelper contract address per network. */
export const EXCHANGE_HELPER_ADDRESS: AddressMap = {
  [SupportedChainId.KOVAN]: '0x8f42aD1F3f570F648E63ae8c8790Dd14EF4f75dB',
}

/* GoodMarketMaker contract address per network. */
export const GOOD_MARKET_MAKER_ADDRESS: AddressMap = {
  [SupportedChainId.KOVAN]: '0xE0fdF6e09C4ac5aa5A8952ac32b16446eE0D0b79',
}
