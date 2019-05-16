// @flow
import { getNetworkName } from '../../../lib/constants/network'
import goodWallet from '../../../lib/wallet/GoodWallet'

export type CodeType = { networkId: number, address: string, amount: number }

/**
 * Returns a dictionary with route and params to be used by screenProps navigation
 * @param {screen} screen
 * @param {object|null} code
 * @returns {Promise<object>} {route, params}
 */
export const routeAndPathForCode = async (screen: string, code: CodeType | null): Promise<any> => {
  if (code === null || !code.networkId || !code.address) {
    throw new Error('Invalid QR Code.')
  }

  const { networkId, address, amount } = code

  await goodWallet.ready
  const currentNetworkId = await goodWallet.wallet.eth.net.getId()

  if (networkId !== currentNetworkId) {
    const networkName = getNetworkName(networkId)
    throw new Error(`Invalid network. Code is meant to be used in ${networkName} network.`)
  }

  switch (screen) {
    case 'sendByQR':
    case 'send':
      if (!amount) {
        return {
          route: 'Amount',
          params: { to: address, nextRoutes: ['Reason', 'SendQRSummary'] }
        }
      } else {
        return {
          route: 'SendQRSummary',
          params: { to: address, amount, reason: 'From QR with Amount' }
        }
      }
    default:
      throw new Error('Invalid screen specified.')
  }
}
