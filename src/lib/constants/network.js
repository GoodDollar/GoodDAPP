// @flow
import { findKey, isEqual, partial, startCase } from 'lodash'

import EthereumLogo from '../../assets/Feed/ethereum-eth-logo.svg'
import GoerliLogo from '../../assets/Feed/goerli.svg'
import FuseLogo from '../../assets/Feed/fuse-logo-new.svg'
import CeloLogo from '../../assets/logos/celo.svg'

export const NETWORK_ID = {
  ETHEREUM: 1,
  ETH: 1,
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GOERLI: 5,
  RSK: 30,
  RSK_TESTNET: 31,
  KOVAN: 42,
  SOKOL: 77,
  POA: 99,
  XDAI: 100,
  FUSE: 122,
  DEVELOP: 4447,
  CELO: 42220,
}

export type NETWORK = $Keys<typeof NETWORK_ID>

/**
 * Returns the network name based on the id provided or UNDEFINED if it's not in the dictionary
 * @param {number} networkId - ethereum network id
 * @returns {string} network name
 */
export const getNetworkName = (networkId: number): string => {
  return startCase(findKey(NETWORK_ID, partial(isEqual, networkId))) || 'UNDEFINED'
}

export const NetworkLogo = {
  [NETWORK_ID.ETH]: EthereumLogo,
  [NETWORK_ID.GOERLI]: GoerliLogo,
  [NETWORK_ID.FUSE]: FuseLogo,
  [NETWORK_ID.CELO]: CeloLogo,
}
