// @flow
import { findKey, isEqual, partial, startCase } from 'lodash'

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

/**
 * Returns the network name based on the id provided or UNDEFINED if it's not in the dictionary
 * @param {number} networkId - ethereum network id
 * @returns {string} network name
 */
export const getNetworkName = (networkId: number): string => {
  return startCase(findKey(NETWORK_ID, partial(isEqual, networkId))) || 'UNDEFINED'
}
