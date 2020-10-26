// @flow
import { getNetworkName } from '../../../lib/constants/network'
import goodWallet from '../../../lib/wallet/GoodWallet'
import userStorage from '../../../lib/gundb/UserStorage'
import { ACTION_SEND_TO_ADDRESS } from './sendReceiveFlow'

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

  const profile = (await userStorage.getUserProfile(address)) || {}

  switch (screen) {
    case 'sendByQR':
    case 'send': {
      const params = {
        address,
        reason,
        amount,
        profile,
        counterPartyDisplayName: profile.name,
        action: ACTION_SEND_TO_ADDRESS,
        type: screen === 'sendByQR' ? 'QR' : 'receive',
      }
      const nextRoutes = ['SendLinkSummary']
      if (!amount) {
        if (!reason) {
          nextRoutes.unshift('Reason')
        }
        return {
          route: 'Amount',
          params: {
            nextRoutes,
            ...params,
          },
        }
      }

      if (!reason) {
        return {
          route: 'Reason',
          params: {
            nextRoutes,
            ...params,
          },
        }
      }

      return {
        route: 'SendLinkSummary',
        params,
      }
    }

    default:
      throw new Error('Invalid screen specified.')
  }
}
