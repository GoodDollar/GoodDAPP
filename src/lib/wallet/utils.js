// @flow

import { MaskService } from 'react-native-masked-text'
import { assign, get, map, noop, zipObject } from 'lodash'

import { ExceptionCategory } from '../exceptions/utils'
import type { TransactionEvent } from '../../userStorage/UserStorageClass'

import pino from '../logger/js-logger'
import { retry } from '../utils/async'

const DECIMALS = 2
const log = pino.child({ from: 'withdraw' })
const ethAddressRegex = /0x[a-fA-F0-9]{40}/

const maskSettings = {
  precision: DECIMALS,
  separator: '.',
  delimiter: ',',
  unit: '',
  suffixUnit: '',
}

type ReceiptType = {
  transactionHash: string,
  transactionIndex: number,
  blockHash: string,
  blockNumber: number,
  from: string,
  to: string,
  status: boolean,
}

export const WITHDRAW_STATUS_PENDING = 'pending'
export const WITHDRAW_STATUS_UNKNOWN = 'unknown'
export const WITHDRAW_STATUS_COMPLETE = 'complete'

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const extractEthAddress = uri => get(uri.match(ethAddressRegex), '0', null)

export const moneyRegexp = new RegExp(`^(?!0\\d)(0|([1-9])\\d*)([.,]?(\\d{0,${DECIMALS}}))$`)
export const numberWithCommas = (gd: string): string => gd.replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/**
 * convert wei to gooddollars (2 decimals) use toFixed to overcome javascript precision issues ie 8.95*100=894.9999...
 * @param {number} wei
 * @returns {string}
 */
export const weiToGd = (wei: number): string => (wei * Math.pow(0.1, DECIMALS)).toFixed(wei % 100 === 0 ? 0 : DECIMALS)

/**
 * convert gooddollars to wei (0 decimals) use toFixed to overcome javascript precision issues ie 8.95*Math.pow(0.1,2)=8.9500000001
 * @param {string} gd
 * @returns {string}
 */
export const gdToWei = (gd: string): string => (gd * Math.pow(10, DECIMALS)).toFixed(0)

const getComposedSettings = (settings?: {} = {}): {} => {
  const { showUnits, ...restSettings } = settings
  const customSettings = { suffixUnit: showUnits ? ' G$' : undefined }
  return { ...maskSettings, ...restSettings, ...customSettings }
}

export const toMask = (gd?: number, settings?: {}): string => {
  const precision = gd && gd % 1 !== 0 ? maskSettings.precision : 0
  return gd ? MaskService.toMask('money', gd, { ...getComposedSettings(settings), precision }) : null
}
export const toRawValue = (masked: string, settings?: {}): number =>
  MaskService.toRawValue('money', masked, getComposedSettings(settings))

export const weiToMask = (wei: number, settings?: {}): string => toMask(weiToGd(wei), settings)
export const maskToWei = (mask: string, settings?: {}): number => gdToWei(toRawValue(mask, settings))

export const getTxLogArgs = tx => {
  try {
    const { arguments: _args, _method, transactionHash } = tx
    const { inputs, name, signature } = _method
    const args = zipObject(map(inputs, 'name'), _args)

    return {
      method: name,
      signature,
      args,
      transactionHash,
    }
  } catch {
    return {
      method: 'unknown',
      signature: null,
      args: {},
    }
  }
}

/**
 * Execute withdraw from a transaction hash, and handle dialogs with process information using Undux
 *
 * @param {string} code - code that unlocks the escrowed payment
 * @param {string} reason - the reason of payment
 * @param {string} category - the category of payment
 * @returns {Promise} Returns the receipt of the transaction
 */
export const executeWithdraw = async (
  code: string,
  reason: string,
  category: string,
  goodWallet: GoodWallet,
  userStorage: UserStorage,
): Promise<ReceiptType | { status: boolean }> => {
  try {
    const { amount, sender, status, hashedCode } = await goodWallet.getWithdrawDetails(code)
    let response = { status }

    log.info('executeWithdraw', { code, reason, category, amount, sender, status, hashedCode })

    if (sender.toLowerCase() === goodWallet.account.toLowerCase()) {
      throw new Error("You can't withdraw your own payment link.")
    }

    if (status === WITHDRAW_STATUS_PENDING) {
      let txHash

      await new Promise((resolve, reject) => {
        goodWallet.withdraw(code, {
          onTransactionHash: transactionHash => {
            txHash = transactionHash

            const transactionEvent: TransactionEvent = {
              id: transactionHash,
              createdDate: new Date().toISOString(),
              date: new Date().toISOString(),
              type: 'withdraw',
              data: {
                from: sender,
                amount,
                code,
                hashedCode,
                reason,
                category,
                otplStatus: 'completed',
              },
            }

            userStorage.enqueueTX(transactionEvent)
            assign(response, { transactionHash })
            resolve(response)
          },
          onError: exception => {
            userStorage.markWithErrorEvent(txHash)
            reject(exception)
          },
        })
      })
    }

    return response
  } catch (e) {
    const { message } = e
    const isOwnLinkIssue = message.endsWith('your own payment link.')
    const logArgs = [
      'code withdraw failed',
      message,
      e,
      {
        code,
        category: isOwnLinkIssue ? ExceptionCategory.Human : ExceptionCategory.Blockhain,
      },
    ]

    if (isOwnLinkIssue) {
      log.warn(...logArgs)
    } else {
      log.error(...logArgs)
    }

    throw e
  }
}

// eslint-disable-next-line
export const retryCall = async asyncFn => retry(asyncFn, 1, 200)

export const safeCall = async (method, defaultValue = {}) => {
  const result = await retryCall(() => method().call()).catch(noop)

  return result || defaultValue
}
