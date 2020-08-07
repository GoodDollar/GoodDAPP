// @flow
import { assign } from 'lodash'
import logger from '../../lib/logger/pino-logger'
import Config from '../../config/config'
import { defaultPromiEvents, GoodWallet as GoodWalletClass } from './GoodWalletClass'

const log = logger.child({ from: 'GoodWallet' })

if (Config.contractsVersion < '1.0.0') {
  return
}

log.debug('patching GoodWallet with new payment links methods')

assign(GoodWalletClass.prototype, {
  /**
   * Generates unique code for the payment link
   * @returns {{code, hashedCode}}
   */
  generatePaymentCode(): { code: string, hashedCode: string } {
    const { accounts } = this.wallet.eth
    const { privateKey: code, address } = accounts.create()
    const hashedCode = address.toLowerCase()

    log.debug('generatePaymentCode:', { code, hashedCode })

    return { code, hashedCode }
  },

  /**
   * Deposits the specified amount to _oneTimeLink_ contract signing tx with hashed code from the payment link
   *
   * @param {*} amount - amount of money to send using OTP
   * @param {*} code - unique link code
   * @param {*} hashedCode - hadhed code value will be used to
   * @param {*} paymentLink
   * @param {*} events
   */
  depositWithPaymentLinkCode(
    amount: number,
    code: string,
    hashedCode: string,
    events: PromiEvents = defaultPromiEvents,
  ): { hashedCode: string, txPromise: Promise } {
    const { abi } = this.wallet.eth
    const txHash = abi.encodeParameter('address', hashedCode)

    log.debug('depositWithPaymentLinkCode:', { amount, code, hashedCode, txHash })

    return this.depositToHash(amount, txHash, events)
  },
})

/**
 * @param otlCode code to unlock payment - a privatekey
 * @returns the payment id - public address
 */
GoodWalletClass.prototype.getWithdrawLink = function(otlCode: string) {
  return this.wallet.eth.accounts.privateKeyToAccount(otlCode).address
}

/**
 * withdraws the payment received in the link to the current wallet holder
 * @param {string} otlCode - the privatekey to unlock payment
 * @param {PromiEvents} callbacks
 */
GoodWalletClass.prototype.withdraw = function(otlCode: string, callbacks: PromiEvents) {
  let method = 'withdraw'
  let args

  if (Config.simulateWithdrawReverted) {
    method = 'setIdentity'
    args = [this.account, this.account]
  } else {
    const paymentId = this.getWithdrawLink(otlCode)
    const toSign = this.wallet.utils.sha3(this.account)

    const privateKeyProof = this.wallet.eth.accounts.sign(toSign, otlCode)
    log.debug('withdraw:', { paymentId, toSign, otlCode, privateKeyProof })
    args = [paymentId, privateKeyProof.signature]
  }

  const withdrawCall = this.oneTimePaymentsContract.methods[method](...args)

  return this.sendTransaction(withdrawCall, callbacks)
}

/**
 * Cancels a Deposit based on its transaction hash
 * @param {string} transactionHash
 * @param {object} txCallbacks
 * @returns {Promise<TransactionReceipt>}
 */
GoodWalletClass.prototype.cancelOTLByTransactionHash = async function(
  transactionHash: string,
  txCallbacks: {} = {},
): Promise<TransactionReceipt> {
  const { logs } = await this.getReceiptWithLogs(transactionHash)
  const paymentDepositLog = logs.filter(({ name }) => name === 'PaymentDeposit')[0]

  if (paymentDepositLog && paymentDepositLog.events) {
    const eventHashParam = paymentDepositLog.events.filter(({ name }) => name === 'paymentId')[0]

    if (eventHashParam) {
      const { value: paymentId } = eventHashParam
      return this.cancelOTL(paymentId, txCallbacks)
    }

    throw new Error('No hash available')
  } else {
    throw new Error('Impossible to cancel OTL')
  }
}
