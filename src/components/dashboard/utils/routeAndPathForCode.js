// @flow
import { NETWORK_ID } from '../../../lib/constants/network'

export type CodeType = { networkId: string, address: string, amount: number }

/**
 * Returns a dictionary with route and params to be used by screenProps navigation
 * @param {screen} screen
 * @param {object|null} code
 * @returns {object} {route, params}
 */
export const routeAndPathForCode = (screen: string, code: CodeType | null): any => {
  if (code === null) {
    throw new Error('Invalid QR Code.')
  }

  const { networkId, address, amount } = code

  if (networkId !== NETWORK_ID.FUSE) {
    throw new Error('Invalid network. Switch to Fuse.')
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
      throw new Error('Invalid screen specified')
  }
}
