// @flow
import { getNetworkName } from '../../../lib/constants/network'
import goodWallet from '../../../lib/wallet/GoodWallet'
import { ACTION_SEND } from './sendReceiveFlow'

export type CodeType = {
  networkId: number,
  address: string,
  amount: number,
  reason: string,
}

/**
 * Returns a dictionary with route and params to be used by screenProps navigation
 * @param {screen} screen
 * @param {object|null} code
 * @returns {Promise<object>} {route, params}
 */
export const routeAndPathForCode = async (
  screen: string,
  code: CodeType | null,
): Promise<{ route: any, params: any }> => {
  if (code === null || !code.networkId || !code.address) {
    throw new Error('Invalid QR Code.')
  }

  const { networkId, address, amount, reason } = code

  await goodWallet.ready
  const currentNetworkId = goodWallet.networkId
  if (networkId !== currentNetworkId) {
    const networkName = getNetworkName(networkId)
    throw new Error(
      `Invalid network. Code is meant to be used in ${networkName} network, not on ${getNetworkName(currentNetworkId)}`,
    )
  }
  if (goodWallet.account.toLowerCase() === address.toLowerCase()) {
    throw new Error("You can't send G$s to yourself, you already own your G$s")
  }

  switch (screen) {
    case 'sendByQR':
    case 'send': {
      const params = { action: ACTION_SEND, type: screen === 'sendByQR' ? 'QR' : 'receive' }
      if (!amount) {
        return {
          route: 'Amount',
          params: { to: address, nextRoutes: ['Reason', 'SendQRSummary'], params },
        }
      }

      return {
        route: 'SendQRSummary',
        params: { to: address, amount, reason: reason || 'From QR with Amount', params },
      }
    }

    default:
      throw new Error('Invalid screen specified.')
  }
}
