// @flow
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.json'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.json'
import OneTimePaymentsABI from '@gooddollar/goodcontracts/build/contracts/OneTimePayments.json'
import ContractsAddress from '@gooddollar/goodcontracts/releases/deployment.json'
import ERC20ABI from '@gooddollar/goodcontracts/build/contracts/ERC20.json'
import UBIABI from '@gooddollar/goodcontracts/build/contracts/FixedUBI.json'
import type Web3 from 'web3'
import { BN, toBN } from 'web3-utils'
import abiDecoder from 'abi-decoder'
import values from 'lodash/values'
import get from 'lodash/get'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { generateShareLink } from '../share'
import WalletFactory from './WalletFactory'

const log = logger.child({ from: 'GoodWallet' })

const DAY_IN_SECONDS = 86400
const MILLISECONDS = 1000
const ZERO = new BN('0')

type EventLog = {
  event: string,
  address: string,
  returnValues: any,
  logIndex: number,
  transactionIndex: number,
  transactionHash: string,
  blockHash: string,
  blockNumber: number,
  raw?: {
    data: string,
    topics: any[],
  },
}

type Log = {
  address: string,
  data: string,
  topics: Array<string | string[]>,
  logIndex: number,
  transactionIndex: number,
  transactionHash: string,
  blockHash: string,
  blockNumber: number,
}

type TransactionReceipt = {
  status: boolean,
  transactionHash: string,
  transactionIndex: number,
  blockHash: string,
  blockNumber: number,
  from: string,
  to: string,
  contractAddress?: string,
  cumulativeGasUsed: number,
  gasUsed: number,
  logs: Log[],
  logsBloom: string,
  events?: {
    [eventName: string]: EventLog,
  },
}

type PromiEvents = {
  onTransactionHash?: Function,
  onReceipt?: Function,
  onConfirmation?: Function,
  onError?: Function,
}

type GasValues = {
  gas?: number,
  gasPrice?: number,
}

const defaultPromiEvents: PromiEvents = {
  onTransactionHash: () => {},
  onReceipt: () => {},
  onConfirmation: () => {},
  onError: () => {},
}

export class GoodWallet {
  static WalletType = 'software'

  static AccountUsageToPath = {
    gd: 0,
    gundb: 1,
    eth: 2,
    donate: 3,
    login: 4,
    zoomId: 5,
  }

  ready: Promise<Web3>

  wallet: Web3

  config: {}

  accountsContract: Web3.eth.Contract

  tokenContract: Web3.eth.Contract

  identityContract: Web3.eth.Contract

  oneTimePaymentsContract: Web3.eth.Contract

  erc20Contract: Web3.eth.Contract

  UBIContract: Web3.eth.Contract

  account: string

  accounts: Array<string>

  networkId: number

  network: string

  gasPrice: number

  subscribers: any = {}

  blockNumber: typeof BN

  constructor(walletConfig: {} = {}) {
    this.config = walletConfig
    this.init()
  }

  init(): Promise<any> {
    const ready = WalletFactory.create(GoodWallet.WalletType, this.config)
    this.ready = ready
      .then(wallet => {
        this.wallet = wallet
        this.accounts = this.wallet.eth.accounts.wallet
        this.account = this.getAccountForType('gd')
        this.wallet.eth.defaultAccount = this.account
        this.networkId = ContractsAddress[Config.network].networkId
        this.network = Config.network
        log.info(`networkId: ${this.networkId}`)
        this.gasPrice = wallet.utils.toWei('1', 'gwei')
        this.wallet.eth.defaultGasPrice = this.gasPrice

        // Identity Contract
        this.identityContract = new this.wallet.eth.Contract(
          IdentityABI.abi,
          get(ContractsAddress, `${this.network}.Identity`, IdentityABI.networks[this.networkId].address),
          { from: this.account }
        )

        // Token Contract
        this.tokenContract = new this.wallet.eth.Contract(
          GoodDollarABI.abi,
          get(ContractsAddress, `${this.network}.GoodDollar`, GoodDollarABI.networks[this.networkId].address),
          { from: this.account }
        )
        abiDecoder.addABI(GoodDollarABI.abi)

        // ERC20 Contract
        this.erc20Contract = new this.wallet.eth.Contract(
          ERC20ABI.abi,
          get(ContractsAddress, `${this.network}.GoodDollar`, GoodDollarABI.networks[this.networkId].address),
          { from: this.account }
        )
        abiDecoder.addABI(ERC20ABI.abi)

        // UBI Contract
        this.UBIContract = new this.wallet.eth.Contract(
          UBIABI.abi,
          get(ContractsAddress, `${this.network}.FixedUBI`, UBIABI.networks[this.networkId].address),
          { from: this.account }
        )
        abiDecoder.addABI(UBIABI.abi)

        // OneTimePaymentLinks Contract
        this.oneTimePaymentsContract = new this.wallet.eth.Contract(
          OneTimePaymentsABI.abi,
          get(ContractsAddress, `${this.network}.OneTimePayments`, OneTimePaymentsABI.networks[this.networkId].address),
          {
            from: this.account,
          }
        )
        abiDecoder.addABI(OneTimePaymentsABI.abi)
        log.info('GoodWallet Ready.', { account: this.account })
      })
      .catch(e => {
        log.error('Failed initializing GoodWallet', e.message, e)
        throw e
      })
    return this.ready
  }

  /**
   * Subscribes to Transfer events (from and to) the current account
   * This is used to verify account balance changes
   * @param {string} fromBlock - defaultValue: '0'
   * @param {function} blockIntervalCallback
   * @returns {Promise<R>|Promise<R|*>|Promise<*>}
   */
  listenTxUpdates(fromBlock: string = '0', blockIntervalCallback: Function) {
    log.debug('listenTxUpdates listening from block:', fromBlock)
    fromBlock = new BN(fromBlock)

    this.subscribeToOTPLEvents(fromBlock, blockIntervalCallback)
    const contract = this.erc20Contract

    //Get transfers from this account
    const fromEventsFilter = {
      fromBlock,
      filter: { from: this.wallet.utils.toChecksumAddress(this.account) },
    }

    contract.events.Transfer(fromEventsFilter, (error, event) => {
      if (error) {
        log.error('listenTxUpdates fromEventsPromise failed:', error.message, error)
      } else {
        log.info('listenTxUpdates subscribed from', event)

        this.getReceiptWithLogs(event.transactionHash)
          .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptUpdated']))
          .catch(err => log.error('send event get/send receipt failed:', err))

        if (event && blockIntervalCallback) {
          blockIntervalCallback({ toBlock: event.blockNumber, event })
        }

        // Send for all events. We could define here different events
        this.getSubscribers('send').forEach(cb => cb(error, [event]))
        this.getSubscribers('balanceChanged').forEach(cb => cb(error, [event]))
      }
    })

    //Get transfers to this account
    const toEventsFilter = {
      fromBlock,
      filter: { to: this.wallet.utils.toChecksumAddress(this.account) },
    }

    contract.events.Transfer(toEventsFilter, (error, event) => {
      if (error) {
        log.warn('listenTxUpdates toEventsPromise failed:', error.message, error)
      } else {
        logger.info('listenTxUpdates subscribed to', event)

        this.getReceiptWithLogs(event.transactionHash)
          .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptReceived']))
          .catch(err => log.error('receive event get/send receipt failed:', err.message, err))

        if (event && blockIntervalCallback) {
          blockIntervalCallback({ toBlock: event.blockNumber, event })
        }

        // Send for all events. We could define here different events
        this.getSubscribers('receive').forEach(cb => cb(error, [event]))
        this.getSubscribers('balanceChanged').forEach(cb => cb(error, [event]))
      }
    })
  }

  subscribeToOTPLEvents(fromBlock: BN, blockIntervalCallback) {
    const filter = { from: this.wallet.utils.toChecksumAddress(this.account) }
    const handler = (error, event) => {
      if (error) {
        log.error('listenTxUpdates fromEventsPromise unexpected error:', error.message, error)
      } else {
        log.info('subscribeOTPL got event', { event })

        if (event && event.event && ['PaymentWithdrawn', 'PaymentCancelled'].includes(event.event)) {
          this.getReceiptWithLogs(event.transactionHash)
            .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['otplUpdated']))
            .catch(err => log.error('send event get/send receipt failed:', err.message, err))
        }

        if (event && blockIntervalCallback) {
          blockIntervalCallback({ toBlock: event.blockNumber, event })
        }
      }
    }

    this.oneTimePaymentsContract.events.PaymentWithdrawn({ fromBlock, filter }, handler)
    this.oneTimePaymentsContract.events.PaymentCancelled({ fromBlock, filter }, handler)
  }

  /**
   * @return an existing (non-pending) transaction receipt information + human readable logs of the transaction
   * @param transactionHash The TX hash to return the data for
   */
  async getReceiptWithLogs(transactionHash: string) {
    const transactionReceipt = await this.wallet.eth.getTransactionReceipt(transactionHash)
    if (!transactionReceipt) {
      return null
    }

    const logs = abiDecoder.decodeLogs(transactionReceipt.logs)
    return { ...transactionReceipt, logs }
  }

  sendReceiptWithLogsToSubscribers(receipt: any, subscriptions: Array<string>) {
    subscriptions.forEach(subscription => {
      this.getSubscribers(subscription).forEach(cb => cb(receipt))
    })
    return receipt
  }

  /**
   * Deletes the current account
   * @returns {Promise<Promise|Q.Promise<TransactionReceipt>|Promise<*>|*>}
   */
  deleteAccount(): Promise<TransactionReceipt> {
    return this.sendTransaction(this.identityContract.methods.renounceWhitelisted())
  }

  /**
   * Claims tokens for current account
   * @returns {Promise<TransactionReceipt>|Promise<Promise|Q.Promise<TransactionReceipt>|Promise<*>|*>}
   */
  claim(callbacks: PromiEvents): Promise<TransactionReceipt> {
    try {
      return this.sendTransaction(this.UBIContract.methods.claim(), callbacks)
    } catch (e) {
      log.info(e)
      return Promise.reject(e)
    }
  }

  async getNextClaimTime(): Promise<any> {
    const lastClaim = (await this.UBIContract.methods.lastClaimed(this.account).call()) || ZERO
    return (lastClaim.toNumber() + DAY_IN_SECONDS) * MILLISECONDS
  }

  async getAmountAndQuantityClaimedToday(): Promise<any> {
    const res = ((await this.UBIContract.methods.getDailyStats().call()) || [ZERO, ZERO]).toNumber()

    return {
      people: res[0],
      amount: res[1],
    }
  }

  async checkEntitlement(): Promise<number> {
    const entitlement = await this.UBIContract.methods.checkEntitlement({ from: this.account }).call()

    return entitlement
  }

  /**
   * Sets an id and place a callback function for this id, for the sent event
   * @dev event can have multiple subscribers, each one recieves it's own id
   * @return {object} subscriber id and eventName
   * @dev so consumer can unsubscribe using id and event name
   */
  subscribeToEvent(eventName: string, cb: Function) {
    if (!this.subscribers[eventName]) {
      // Get last id from subscribersList
      this.subscribers[eventName] = {}
    }

    const subscribers = this.subscribers[eventName]
    const id = Math.max(...Object.keys(subscribers).map(parseInt), 0) + 1 // Give next id in a raw to current subscriber
    this.subscribers[eventName][id] = cb

    return { id, eventName }
  }

  /**
   * removes subscriber from subscriber list with the specified id and event name
   * @param {event} event
   */
  unsubscribeFromEvent({ eventName, id }: { eventName: string, id: number }) {
    delete this.subscribers[eventName][id]
  }

  /**
   * Gets all subscribers as array for given eventName
   * @param {string} eventName
   * @return a json object containing all subscribers for the specified event name
   */
  getSubscribers(eventName: string): Function {
    return values(this.subscribers[eventName] || {})
  }

  /**
   * Listen to balance changes for the current account
   * @param cb
   * @returns {Promise<void>}
   */
  balanceChanged(cb: Function) {
    this.subscribeToEvent('balanceChanged', cb)
  }

  /**
   * Retrieves current Block Number and returns it as converted to a BN instance
   * @returns {Promise<BN>} - Current block number in BN instance
   */
  getBlockNumber(): Promise<BN> {
    return this.wallet.eth.getBlockNumber().then(toBN)
  }

  balanceOf(): Promise<number> {
    return this.tokenContract.methods.balanceOf(this.account).call()
  }

  signMessage() {}

  sendTx() {}

  getAccountForType(type: AccountUsage): string {
    let account = this.accounts[GoodWallet.AccountUsageToPath[type]].address || this.wallet.eth.defaultAccount
    return account.toString()
  }

  async sign(toSign: string, accountType: AccountUsage = 'gd'): Promise<string> {
    let account = this.getAccountForType(accountType)
    let signed = await this.wallet.eth.sign(toSign, account)
    return signed.signature
  }

  /**
   * Determines if a specified address is verified in the blockchain
   * @param address
   * @returns {Promise<boolean>}
   */
  isVerified(address: string): Promise<boolean> {
    return this.identityContract.methods.isClaimer(address).call()
  }

  /**
   * Determines if current user is verified in the blockchain
   * @returns {Promise<boolean>}
   */
  isCitizen(): Promise<boolean> {
    return this.isVerified(this.account)
  }

  /**
   * Get transaction fee from GoodDollarReserveContract
   * @returns {Promise<boolean>}
   */
  getTxFee(): Promise<boolean> {
    return this.reserveContract.methods
      .transactionFee()
      .call()
      .then(toBN)
  }

  /**
   * Get transaction fee from GoodDollarReserveContract
   * @returns {Promise<boolean>}
   */
  async calculateTxFee(amount): Promise<boolean> {
    // 1% is represented as 10000, and divided by 1000000 when required to be % representation to enable more granularity in the numbers (as Solidity doesn't support floating point)
    const percents = await this.getTxFee()

    return new BN(amount).mul(percents).div(new BN('1000000'))
  }

  /**
   * Checks if use can send an specific amount of G$s
   * @param {number} amount
   * @param {object} options
   * @returns {Promise<boolean>}
   */
  async canSend(amount: number, options = {}): Promise<boolean> {
    const { feeIncluded = false } = options
    let amountWithFee = amount

    if (!feeIncluded) {
      // 1% is represented as 10000, and divided by 1000000 when required to be % representation to enable more granularity in the numbers (as Solidity doesn't support floating point)
      const fee = await this.calculateTxFee(amount)

      amountWithFee = new BN(amount).add(fee)
    }

    const balance = await this.balanceOf()
    return parseInt(amountWithFee) <= parseInt(balance)
  }

  /**
   * perform transaction to deposit amount into the OneTimePaymentLink contract
   * @param {number} amount
   * @param {string} hashedCode
   * @param {PromieEvents} events
   */
  async depositToHash(amount: number, hashedCode: string, events: PromiEvents): any {
    if (!(await this.canSend(amount))) {
      throw new Error(`Amount is bigger than balance`)
    }

    const otpAddress = get(
      ContractsAddress,
      `${this.network}.OneTimePaymentLinks`,
      OneTimePaymentsABI.networks[this.networkId].address
    )

    const transferAndCall = this.tokenContract.methods.transferAndCall(otpAddress, amount, hashedCode, {
      from: this.account,
    })

    // Fixed gas amount so it can work locally with ganache
    // https://github.com/trufflesuite/ganache-core/issues/417
    const gas: number = 200000 //Math.floor((await transferAndCall.estimateGas().catch(this.handleError)) * 2)

    //dont wait for transaction return immediatly with hash code and link (not using await here)
    return this.sendTransaction(transferAndCall, events, { gas })
  }

  /**
   * deposits the specified amount to _oneTimeLink_ contract and generates a link that will send the user to a URL to withdraw it
   * @param {number} amount - amount of money to send using OTP
   * @param {string} reason - optional reason for sending the payment (comment)
   * @param {({ link: string, code: string }) => () => any} getOnTxHash - a callback that returns onTransactionHashHandler based on generated code
   * @param {PromiEvents} events - used to subscribe to onTransactionHash event
   * @returns {{code, hashedCode, paymentLink}}
   */
  generateLink(
    amount: number,
    reason: string = '',
    getOnTxHash: (extraData: { paymentLink: string, code: string }) => (hash: string) => any,
    events: PromiEvents = defaultPromiEvents
  ): { code: string, hashedCode: string, paymentLink: string } {
    const code = this.wallet.utils.randomHex(10).replace('0x', '')
    const hashedCode = this.wallet.utils.sha3(code)

    log.debug('generateLink:', { amount })

    const paymentLink = generateShareLink('send', {
      paymentCode: code,
      reason,
    })

    //pass extra data
    const onTransactionHash = getOnTxHash({ paymentLink, code })

    this.depositToHash(amount, hashedCode, { ...events, onTransactionHash })

    return {
      code,
      hashedCode,
      paymentLink,
    }
  }

  getWithdrawLink(otlCode: string) {
    return this.wallet.utils.sha3(otlCode)
  }

  /**
   * checks against oneTimeLink contract, if the specified hash code has already been used to send payment or not.
   * @param {string} link
   * @returns {Promise<boolean>}
   */
  isWithdrawLinkUsed(link: string): Promise<boolean> {
    const { hasPayment } = this.oneTimePaymentsContract.methods
    return hasPayment(link).call()
  }

  /**
   * Checks if getWithdrawAvailablePayment returned a valid payment (BN handle), positive balance
   * @param {BN} payment
   * @returns boolean
   */
  isWithdrawPaymentAvailable(payment: typeof BN): boolean {
    return payment.gt(ZERO)
  }

  /**
   * The amount of GoodDollars resides in the oneTimeLink contract under the specified link, in BN representation.
   * @param {string} link
   * @returns {Promise<BN>}
   */
  getWithdrawAvailablePayment(link: string): Promise<BN> {
    const { payments } = this.oneTimePaymentsContract.methods
    const { toBN } = this.wallet.utils

    const amount = payments(link).call().paymentAmount

    return amount.then(toBN)
  }

  /**
   * Depending on what's queried off the blockchain for the OTL code, will return an status to display
   * @param otlCode - one time link code
   * @returns {Promise<'Completed' | 'Cancelled' | 'Pending'>}
   */
  async getWithdrawStatus(otlCode: string): Promise<'Completed' | 'Cancelled' | 'Pending'> {
    const link = this.getWithdrawLink(otlCode)

    // Check payment availability
    const paymentAvailable = await this.getWithdrawAvailablePayment(link)
    if (this.isWithdrawPaymentAvailable(paymentAvailable)) {
      return 'Pending'
    }

    return 'Completed'
  }

  /**
   * verifies otlCode link has not been used, and payment available. If yes for both, returns the original payment sender address and the amount of GoodDollars payment.
   * @param {string} otlCode - the payment identifier in OneTimePaymentLink contract
   */
  async canWithdraw(otlCode: string) {
    const { payments } = this.oneTimePaymentsContract.methods

    const link = this.getWithdrawLink(otlCode)

    // Check link availability
    const linkUsed = await this.isWithdrawLinkUsed(link)
    if (!linkUsed) {
      throw new Error('Could not find payment or incorrect code')
    }

    // Check payment availability
    const paymentAvailable = await this.getWithdrawAvailablePayment(link)
    if (this.isWithdrawPaymentAvailable(paymentAvailable) === false) {
      throw new Error('Payment already withdrawn')
    }

    const sender = await payments(link).call().paymentSender
    return {
      amount: paymentAvailable.toString(),
      sender,
    }
  }

  /**
   * withdraws the payment received in the link to the current wallet holder
   * @param {string} otlCode
   * @param {PromiEvents} promiEvents
   */
  withdraw(otlCode: string, promiEvents: ?PromiEvents) {
    const withdrawCall = this.oneTimePaymentsContract.methods.withdraw(otlCode)
    log.info('withdrawCall', withdrawCall)
    return this.sendTransaction(withdrawCall, { ...defaultPromiEvents, ...promiEvents })
  }

  /**
   * Cancels a Deposit based on its transaction hash
   * @param {string} transactionHash
   * @param {object} txCallbacks
   * @returns {Promise<TransactionReceipt>}
   */
  async cancelOTLByTransactionHash(transactionHash: string, txCallbacks: {} = {}): Promise<TransactionReceipt> {
    const { logs } = await this.getReceiptWithLogs(transactionHash)
    const paymentDepositLog = logs.filter(({ name }) => name === 'PaymentDeposited')[0]

    if (paymentDepositLog && paymentDepositLog.events) {
      const eventHashParam = paymentDepositLog.events.filter(({ name }) => name === 'hash')[0]

      if (eventHashParam) {
        const { value: hash } = eventHashParam
        return this.cancelOTL(hash, txCallbacks)
      }

      throw new Error('No hash available')
    } else {
      throw new Error('Impossible to cancel OTL')
    }
  }

  /**
   * cancels payment link and return the money to the sender (if not been withdrawn already)
   * @param {string} hashedCode
   * @param {object} txCallbacks
   * @returns {Promise<TransactionReceipt>}
   */
  cancelOTL(hashedCode: string, txCallbacks: {} = {}): Promise<TransactionReceipt> {
    const cancelOtlCall = this.oneTimePaymentsContract.methods.cancel(hashedCode, , { from: this.account })
    return this.sendTransaction(cancelOtlCall, {
      ...txCallbacks,
      onTransactionHash: hash => {
        log.debug({ hash })
        txCallbacks.onTransactionHash(hash)
      },
    })
  }

  handleError(e: Error) {
    log.error('handleError', e.message, e)
    throw e
  }

  async getGasPrice(): Promise<number> {
    let gasPrice = this.gasPrice

    try {
      const { toBN } = this.wallet.utils
      const networkGasPrice = await this.wallet.eth.getGasPrice().then(toBN)

      if (networkGasPrice.gt(toBN('0'))) {
        gasPrice = networkGasPrice.toString()
      }
    } catch (e) {
      log.error('failed to retrieve gas price from network', e.message, e)
    }

    return gasPrice
  }

  async sendAmount(to: string, amount: number, events: PromiEvents): Promise<TransactionReceipt> {
    if (!this.wallet.utils.isAddress(to)) {
      throw new Error('Address is invalid')
    }

    if (amount === 0 || !(await this.canSend(amount))) {
      throw new Error('Amount is bigger than balance')
    }

    log.info({ amount, to })
    const transferCall = this.tokenContract.methods.transfer(to, amount.toString()) // retusn TX object (not sent to the blockchain yet)

    return this.sendTransaction(transferCall, events) // Send TX to the blockchain
  }

  /**
   * Helper to check if user has enough native token balance, if not try to ask server to topwallet
   * @param {number} wei
   * @param {object} options
   */
  async verifyHasGas(wei: number, options = {}) {
    const { topWallet = true } = options

    let nativeBalance = await this.wallet.eth.getBalance(this.account)
    if (nativeBalance > wei) {
      return {
        ok: true,
      }
    }

    if (topWallet) {
      const toppingRes = await API.verifyTopWallet()
      if (!toppingRes.ok && toppingRes.sendEtherOutOfSystem) {
        return {
          error: true,
        }
      }
      nativeBalance = await this.wallet.eth.getBalance(this.account)

      return {
        ok: toppingRes.ok && nativeBalance > wei,
      }
    }

    return {
      ok: false,
    }
  }

  /**
   * Helper function to handle a tx Send call
   * @param tx
   * @param {PromiEvents} txCallbacks
   * @param {function} txCallbacks.onTransactionHash
   * @param {function} txCallbacks.onReceipt
   * @param {function} txCallbacks.onConfirmation
   * @param {function} txCallbacks.onError
   * @param {object} gasValues
   * @param {number} gasValues.gas
   * @param {number} gasValues.gasPrice
   * @returns {Promise<Promise|Q.Promise<TransactionReceipt>|Promise<*>|Promise<*>|Promise<*>|*>}
   */
  async sendTransaction(
    tx: any,
    txCallbacks: PromiEvents = defaultPromiEvents,
    { gas, gasPrice }: GasValues = { gas: undefined, gasPrice: undefined }
  ) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = { ...defaultPromiEvents, ...txCallbacks }
    gas = gas || (await tx.estimateGas().catch(this.handleError))
    gasPrice = gasPrice || this.gasPrice

    const { ok } = await this.verifyHasGas(gas * gasPrice)
    if (ok === false) {
      return Promise.reject('Reached daily transactions limit or not a citizen').catch(this.handleError)
    }

    log.debug({ gas, gasPrice })
    return (
      new Promise((res, rej) => {
        tx.send({ gas, gasPrice, chainId: this.networkId })
          .on('transactionHash', h => {
            onTransactionHash && onTransactionHash(h)
          })
          .on('receipt', r => {
            onReceipt && onReceipt(r)
            res(r)
          })
          .on('confirmation', c => onConfirmation && onConfirmation(c))
          .on('error', e => {
            onError && onError(e)
            rej(e)
          })
      })

        /** receipt handling happens already in polling events */
        // .then(async receipt => {
        //   const transactionReceipt = await this.getReceiptWithLogs(receipt.transactionHash)
        //   await this.sendReceiptWithLogsToSubscribers(transactionReceipt, ['receiptReceived', 'receiptUpdated'])
        //   return transactionReceipt
        // })
        .catch(this.handleError)
    )
  }
}

export const WalletType = GoodWallet.WalletType
export type AccountUsage = $Keys<typeof GoodWallet.AccountUsageToPath>
