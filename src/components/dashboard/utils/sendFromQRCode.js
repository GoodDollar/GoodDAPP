// @flow
import { NETWORK_ID } from '../../../lib/constants/network'

export type CodeType = { networkId: string, address: string, amount: number }

/**
 * Returns a function that will decide where to navigate depending on the screen specified
 * @param {screen} screen
 * @returns {Function}
 */
export const sendFromQRCode = (screen: string): Function =>
  /**
   * Curried function that decides where to navigate based on the content of the code and the screen provided
   * @param {object|null} code
   * @returns {*[]}
   */
  (code: CodeType | null): any => {
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
          return ['Amount', { to: address, nextRoutes: ['Reason', 'SendQRSummary'] }]
        } else {
          return ['SendQRSummary', { to: address, amount, reason: 'From QR with Amount' }]
        }
      default:
        throw new Error('Invalid screen specified')
    }
  }
