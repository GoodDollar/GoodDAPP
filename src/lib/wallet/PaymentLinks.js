// @flow
import logger from '../../lib/logger/pino-logger'
import Config from '../../config/config'
import { generateShareLink } from '../share'
import { GoodWallet as GoodWalletClass } from './GoodWalletClass'

const log = logger.child({ from: 'GoodWallet' })
if (Config.contractsVersion >= '1.0.0') {
  const defaultPromiEvents: PromiEvents = {
    onTransactionHash: () => {},
    onReceipt: () => {},
    onConfirmation: () => {},
    onError: () => {},
  }
  log.debug('patching GoodWallet with new payment links methods')

  /**
   * deposits the specified amount to _oneTimeLink_ contract and generates a link that will send the user to a URL to withdraw it
   * @param {number} amount - amount of money to send using OTP
   * @param {string} reason - optional reason for sending the payment (comment)
   * @param {({ link: string, code: string }) => () => any} getOnTxHash - a callback that returns onTransactionHashHandler based on generated code
   * @param {PromiEvents} events - used to subscribe to onTransactionHash event
   * @returns {{code, hashedCode, paymentLink}}
   */
  GoodWalletClass.prototype.generateLink = function(
    amount: number,
    reason: string = '',
    events: PromiEvents = defaultPromiEvents
  ): { code: string, hashedCode: string, paymentLink: string } {
    const { privateKey: code, address: hashedCode } = this.wallet.eth.accounts.create()

    log.debug('generateLink:', { amount, code, hashedCode })

    const paymentLink = generateShareLink('send', {
      p: code,
      r: reason,
    })

    const asParam = this.wallet.eth.abi.encodeParameter('address', hashedCode)

    const txPromise = this.depositToHash(amount, asParam, events)

    return {
      code,
      hashedCode: hashedCode.toLowerCase(),
      paymentLink,
      txPromise,
    }
  }

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
    txCallbacks: {} = {}
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
}
