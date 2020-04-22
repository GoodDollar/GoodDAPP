// @flow
import type { Store } from 'undux'
import goodWallet from '../../wallet/GoodWallet'
import pino from '../../logger/pino-logger'
import userStorage from '../../gundb/UserStorage'
import type { TransactionEvent } from '../../gundb/UserStorage'
import { WITHDRAW_STATUS_PENDING } from '../../wallet/GoodWalletClass'

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
 * @param {string} reason - the reason of payment
 * @returns {Promise} Returns the receipt of the transaction
 */
export const executeWithdraw = async (
  store: Store,
  code: string,
  reason: string
): Promise<ReceiptType | { status: boolean }> => {
  log.info('executeWithdraw', code, reason)
  try {
    const { amount, sender, status } = await goodWallet.getWithdrawDetails(code)
    if (status === WITHDRAW_STATUS_PENDING) {
      let txHash

      return new Promise((res, rej) => {
        goodWallet.withdraw(code, {
          onTransactionHash: transactionHash => {
            txHash = transactionHash

            const transactionEvent: TransactionEvent = {
              id: transactionHash,
              date: new Date().toString(),
              type: 'withdraw',
              data: {
                from: sender,
                amount,
                code,
                reason,
                otplStatus: 'completed',
              },
            }
            userStorage.enqueueTX(transactionEvent)
            res({ status, transactionHash })
          },
          onError: e => {
            userStorage.markWithErrorEvent(txHash)
            rej(e)
          },
        })
      })
    }
    return { status }
  } catch (e) {
    log.error('code withdraw failed', e.message, e, { code })
    throw e
  }
}

export const prepareDataWithdraw = params => {
  const { paymentCode, reason } = params
  let paymentParams = null

  if (paymentCode) {
    try {
      paymentParams = Buffer.from(decodeURI(paymentCode), 'base64').toString()
      paymentParams = JSON.parse(paymentParams)
    } catch (e) {
      log.info('uses old format', { paymentCode, reason })
      paymentParams = {
        paymentCode: decodeURI(paymentCode),
        reason: reason ? decodeURI(reason) : null,
      }
    }
  }

  return paymentParams
}
