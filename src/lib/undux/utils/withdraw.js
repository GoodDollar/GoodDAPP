// @flow
import type { Store } from 'undux'
import goodWallet from '../../wallet/GoodWallet'
import pino from '../../logger/pino-logger'
import userStorage from '../../gundb/UserStorage'
import type { TransactionEvent } from '../../gundb/UserStorage'

const log = pino.child({ from: 'withdraw' })

type ReceiptType = {
  transactionHash: string,
  transactionIndex: number,
  blockHash: string,
  blockNumber: number,
  from: string,
  to: string,
  status: boolean
}

/**
 * Execute withdraw from a transaction hash, and handle dialogs with process information using Undux
 *
 * @param {Store} store - Undux store
 * @param {string} hash - Transaction hash / event id
 * @returns {Promise} Returns the receipt of the transaction
 */
export const executeWithdraw = async (store: Store, hash: string, reason: string): Promise<ReceiptType> => {
  log.info('executeWithdraw', hash, reason)
  try {
    const { amount } = await goodWallet.canWithdraw(hash)
    const receipt = await goodWallet.withdraw(hash, {
      onTransactionHash: transactionHash => {
        const transactionEvent: TransactionEvent = {
          id: transactionHash,
          date: new Date().toString(),
          type: 'withdraw',
          data: {
            amount,
            hash,
            reason
          }
        }
        userStorage.enqueueTX(transactionEvent)
      }
    })
    return receipt
  } catch (e) {
    log.error({ e })
    throw e
  }
}
