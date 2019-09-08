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
  status: boolean,
}

/**
 * Execute withdraw from a transaction hash, and handle dialogs with process information using Undux
 *
 * @param {Store} store - Undux store
 * @param {string} code - code that unlocks the escrowed payment
 * @returns {Promise} Returns the receipt of the transaction
 */
export const executeWithdraw = async (store: Store, code: string, reason: string): Promise<ReceiptType> => {
  log.info('executeWithdraw', code, reason)
  try {
    const { amount, sender } = await goodWallet.canWithdraw(code)
    return new Promise((res, rej) => {
      goodWallet.withdraw(code, {
        onTransactionHash: transactionHash => {
          const transactionEvent: TransactionEvent = {
            id: transactionHash,
            date: new Date().toString(),
            type: 'withdraw',
            data: {
              from: sender,
              amount,
              code,
              reason,
            },
          }
          userStorage.enqueueTX(transactionEvent)
          res(transactionHash)
        },
        onError: e => {
          userStorage.markWithErrorEvent(e)
          rej(e)
        },
      })
    })
  } catch (e) {
    log.error('code withdraw failed', code, e.message, e)
    throw e
  }
}
