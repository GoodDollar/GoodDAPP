// @flow
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.min.json'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.min.json'
import OneTimePaymentsABI from '@gooddollar/goodcontracts/build/contracts/OneTimePayments.min.json'
import ContractsAddress from '@gooddollar/goodcontracts/releases/deployment.json'
import ERC20ABI from '@gooddollar/goodcontracts/build/contracts/ERC20.min.json'
import UBIABI from '@gooddollar/goodcontracts/build/contracts/FixedUBI.min.json'
import type Web3 from 'web3'
import { BN, toBN } from 'web3-utils'
import abiDecoder from 'abi-decoder'
import { get, values } from 'lodash'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import API from '../API/api'
import { generateShareLink } from '../share'
import WalletFactory from './WalletFactory'

const log = logger.child({ from: 'GoodWallet' })

const DAY_IN_SECONDS = window.nextTimeClaim ? Number(window.nextTimeClaim) : Number(Config.nextTimeClaim)
const MILLISECONDS = 1000
const ZERO = new BN('0')

//17280 = 24hours seconds divided by 5 seconds blocktime
const DAY_TOTAL_BLOCKS = (60 * 60 * 24) / 5

export const WITHDRAW_STATUS_PENDING = 'pending'
export const WITHDRAW_STATUS_UNKNOWN = 'unknown'
export const WITHDRAW_STATUS_COMPLETE = 'complete'

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

  config: {}

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
    this.ready = WalletFactory.create(GoodWallet.WalletType, this.config)
      .then(wallet => {
        log.info('GoodWallet initial wallet created.')
        this.wallet = wallet
        this.accounts = this.wallet.eth.accounts.wallet
        this.account = this.getAccountForType('gd')
        this.wallet.eth.defaultAccount = this.account
        this.networkId = ContractsAddress[Config.network].networkId
        this.network = Config.network
        log.info(`networkId: ${this.networkId}`)
        this.gasPrice = wallet.utils.toWei('1', 'gwei')
        this.wallet.eth.defaultGasPrice = this.gasPrice

        log.info('GoodWallet setting up contracts:')

        // Identity Contract
        this.identityContract = new this.wallet.eth.Contract(
          IdentityABI.abi,
          get(ContractsAddress, `${this.network}.Identity` /*IdentityABI.networks[this.networkId].address*/),
          { from: this.account }
        )

        // Token Contract
        this.tokenContract = new this.wallet.eth.Contract(
          GoodDollarABI.abi,
          get(ContractsAddress, `${this.network}.GoodDollar` /*GoodDollarABI.networks[this.networkId].address*/),
          { from: this.account }
        )
        abiDecoder.addABI(GoodDollarABI.abi)

        // ERC20 Contract
        this.erc20Contract = new this.wallet.eth.Contract(
          ERC20ABI.abi,
          get(ContractsAddress, `${this.network}.GoodDollar` /*GoodDollarABI.networks[this.networkId].address*/),
          { from: this.account }
        )
        abiDecoder.addABI(ERC20ABI.abi)

        // UBI Contract
        this.UBIContract = new this.wallet.eth.Contract(
          UBIABI.abi,
          get(ContractsAddress, `${this.network}.UBI` /*UBIABI.networks[this.networkId].address*/),
          { from: this.account }
        )
        abiDecoder.addABI(UBIABI.abi)

        // OneTimePaymentLinks Contract
        this.oneTimePaymentsContract = new this.wallet.eth.Contract(
          OneTimePaymentsABI.abi,
          get(
            ContractsAddress,
            `${this.network}.OneTimePayments` /*OneTimePaymentsABI.networks[this.networkId].address*/
          ),
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

  getSignUpBonusAddress() {
    return get(ContractsAddress, `${this.network}.SignupBonus`).toLowerCase()
  }

  /**
   * Subscribes to Transfer events (from and to) the current account
   * This is used to verify account balance changes
   * @param {string} fromBlock - defaultValue: '0'
   * @param {function} blockIntervalCallback
   * @returns {Promise<R>|Promise<R|*>|Promise<*>}
   */
  async listenTxUpdates(fromBlock: int = 0, blockIntervalCallback: Function) {
    const curBlock = await this.wallet.eth.getBlockNumber()
    const dayAgoBlock = Math.max(0, fromBlock - DAY_TOTAL_BLOCKS)
    log.debug('listenTxUpdates listening from block:', { fromBlock, dayAgoBlock })
    fromBlock = new BN(dayAgoBlock <= curBlock ? dayAgoBlock : curBlock)

    this.subscribeToOTPLEvents(fromBlock, blockIntervalCallback)
    const contract = this.erc20Contract

    //Get transfers from this account
    const fromEventsFilter = {
      fromBlock,
      filter: { from: this.wallet.utils.toChecksumAddress(this.account) },
    }

    contract.events.Transfer(fromEventsFilter, (error, event) => {
      if (error) {
        // eslint-disable-next-line no-negated-condition
        if (error.currentTarget === undefined || error.currentTarget.readyState !== error.currentTarget.CLOSED) {
          log.error('listenTxUpdates fromEventsPromise failed:', error.message, error)
        } else {
          log.warn('listenTxUpdates fromEventsPromise failed:', error.message, error)
        }
      } else {
        log.info('listenTxUpdates subscribed from', event)

        this.getReceiptWithLogs(event.transactionHash)
          .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptUpdated']))
          .catch(err => log.error('send event get/send receipt failed:', err.message, err))

        if (event && event.blockNumber && blockIntervalCallback) {
          blockIntervalCallback({ toBlock: event.blockNumber, event })
        }

        // Send for all events. We could define here different events
        this.getSubscribers('send').forEach(cb => cb(event))
        this.getSubscribers('balanceChanged').forEach(cb => cb(event))
      }
    })

    //Get transfers to this account
    const toEventsFilter = {
      fromBlock,
      filter: { to: this.wallet.utils.toChecksumAddress(this.account) },
    }

    contract.events.Transfer(toEventsFilter, (error, event) => {
      if (error) {
        // eslint-disable-next-line no-negated-condition
        if (error.currentTarget === undefined || error.currentTarget.readyState !== error.currentTarget.CLOSED) {
          log.error('listenTxUpdates toEventsPromise failed:', error.message, error)
        } else {
          log.warn('listenTxUpdates toEventsPromise failed:', error.message, error)
        }
      } else {
        logger.info('listenTxUpdates subscribed to', event)

        this.getReceiptWithLogs(event.transactionHash)
          .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptReceived']))
          .catch(err => log.error('receive event get/send receipt failed:', err.message, err))

        if (event && blockIntervalCallback) {
          blockIntervalCallback({ toBlock: event.blockNumber, event })
        }

        // Send for all events. We could define here different events
        this.getSubscribers('receive').forEach(cb => cb(event))
        this.getSubscribers('balanceChanged').forEach(cb => cb(event))
      }
    })
  }

  subscribeToOTPLEvents(fromBlock: BN, blockIntervalCallback) {
    const filter = { from: this.wallet.utils.toChecksumAddress(this.account) }
    const handler = (error, event) => {
      if (error) {
        // eslint-disable-next-line no-negated-condition
        if (error.currentTarget === undefined || error.currentTarget.readyState !== error.currentTarget.CLOSED) {
          log.error('listenTxUpdates fromEventsPromise unexpected error:', error.message, error)
        } else {
          log.warn('listenTxUpdates fromEventsPromise unexpected error:', error.message, error)
        }
      } else {
        log.info('subscribeOTPL got event', { event })

        if (event && event.event && ['PaymentWithdraw', 'PaymentCancel'].includes(event.event)) {
          this.getReceiptWithLogs(event.transactionHash)
            .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['otplUpdated']))
            .catch(err => log.error('send event get/send receipt failed:', err.message, err))
        }

        if (event && blockIntervalCallback) {
          blockIntervalCallback({ toBlock: event.blockNumber, event })
        }
      }
    }

    this.oneTimePaymentsContract.events.PaymentWithdraw({ fromBlock, filter }, handler)
    this.oneTimePaymentsContract.events.PaymentCancel({ fromBlock, filter }, handler)
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
      log.error('claim failed', e.message, e)
      return Promise.reject(e)
    }
  }

  async getNextClaimTime(): Promise<any> {
    try {
      const lastClaim = (await this.UBIContract.methods.lastClaimed(this.account).call()) || ZERO
      return (lastClaim.toNumber() + DAY_IN_SECONDS) * MILLISECONDS
    } catch (e) {
      log.error('getNextClaimTime failed', e.message, e)
      return Promise.reject(e)
    }
  }

  async getAmountAndQuantityClaimedToday(): Promise<any> {
    try {
      const res = (await this.UBIContract.methods.getDailyStats().call()) || [ZERO, ZERO]
      return {
        people: res[0].toNumber(),
        amount: res[1].toNumber(),
      }
    } catch (e) {
      log.error('getAmountAndQuantityClaimedToday failed', e.message, e)
      return Promise.reject(e)
    }
  }

  async checkEntitlement(): Promise<number> {
    try {
      const entitlement = await this.UBIContract.methods.checkEntitlement().call()
      return entitlement
    } catch (e) {
      log.error('getNextClaimTime failed', e.message, e)
      return Promise.reject(e)
    }
  }

  /**
   * Sets an id and place a callback function for this id, for the sent event
   * @dev event can have multiple subscribers, each one recieves it's own id
   * @return {object} subscriber id and eventName
   * @dev so consumer can unsubscribe using id and event name
   */
  subscribeToEvent(eventName: string, cb: (EventLog | TransactionReceipt) => any) {
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
    return this.subscribeToEvent('balanceChanged', cb)
  }

  /**
   * Retrieves current Block Number and returns it as converted to a BN instance
   * @returns {Promise<BN>} - Current block number in BN instance
   */
  getBlockNumber(): Promise<BN> {
    return this.wallet.eth.getBlockNumber().then(toBN)
  }

  balanceOf(): Promise<number> {
    return this.tokenContract.methods
      .balanceOf(this.account)
      .call()
      .then(toBN)
      .then(_ => _.toNumber())
  }

  balanceOfNative(): Promise<number> {
    return this.wallet.eth.getBalance(this.account).then(parseInt)
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
    return this.identityContract.methods.isWhitelisted(address).call()
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
    return this.tokenContract.methods
      .getFees(1)
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
    return parseInt(amountWithFee) <= balance
  }

  /**
   * perform transaction to deposit amount into the OneTimePaymentLink contract
   * @param {number} amount
   * @param {string} hashedCode
   * @param {PromieEvents} callbacks
   */
  async depositToHash(amount: number, hashedCode: string, callbacks: PromiEvents): Promise<TransactionReceipt> {
    if (!(await this.canSend(amount))) {
      throw new Error(`Amount is bigger than balance`)
    }

    const otpAddress = this.oneTimePaymentsContract.address
    const transferAndCall = this.tokenContract.methods.transferAndCall(otpAddress, amount, hashedCode)

    // Fixed gas amount so it can work locally with ganache
    // https://github.com/trufflesuite/ganache-core/issues/417
    const gas: number = 200000 //Math.floor((await transferAndCall.estimateGas().catch(this.handleError)) * 2)

    //dont wait for transaction return immediatly with hash code and link (not using await here)
    return this.sendTransaction(transferAndCall, callbacks, { gas })
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
    events: PromiEvents = defaultPromiEvents
  ): { code: string, hashedCode: string, paymentLink: string } {
    const code = this.wallet.utils.randomHex(10).replace('0x', '')
    const hashedCode = this.wallet.utils.sha3(code)

    log.debug('generateLink:', { amount })

    const paymentLink = generateShareLink('send', {
      paymentCode: code,
      reason,
    })

    const txPromise = this.depositToHash(amount, hashedCode, events)

    return {
      code,
      hashedCode,
      paymentLink,
      txPromise,
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
   * Depending on what's queried off the blockchain for the OTL code, will return an status to display
   * @param otlCode - one time link code
   * @returns {Promise<'Completed' | 'Cancelled' | 'Pending'>}
   */
  async getWithdrawDetails(otlCode: string): Promise<'Completed' | 'Cancelled' | 'Pending'> {
    const hash = this.getWithdrawLink(otlCode)
    const { payments } = this.oneTimePaymentsContract.methods

    const { paymentAmount, paymentSender, hasPayment } = await payments(hash).call()
    const amount = toBN(paymentAmount).toNumber()
    let status = WITHDRAW_STATUS_UNKNOWN

    // Check payment availability
    if (hasPayment && amount > 0) {
      status = WITHDRAW_STATUS_PENDING
    }
    if (hasPayment === false && toBN(paymentSender).isZero() === false) {
      status = WITHDRAW_STATUS_COMPLETE
    }
    return {
      status,
      amount,
      sender: paymentSender,
    }
  }

  /**
   * withdraws the payment received in the link to the current wallet holder
   * @param {string} otlCode
   * @param {PromiEvents} callbacks
   */
  async withdraw(otlCode: string, callbacks: PromiEvents) {
    let method = 'withdraw'
    let args = [otlCode]

    if (Config.simulateWithdrawReverted) {
      method = 'setIdentity'
      args = [this.account, this.account]
    }

    const withdrawCall = this.oneTimePaymentsContract.methods[method](...args)
    const gasLimit = await this.oneTimePaymentsContract.methods.gasLimit.call().then(toBN)

    //contract enforces max gas of 80000 to prevent front running
    return this.sendTransaction(withdrawCall, callbacks, { gas: gasLimit.toNumber() })
  }

  /**
   * Cancels a Deposit based on its transaction hash
   * @param {string} transactionHash
   * @param {object} txCallbacks
   * @returns {Promise<TransactionReceipt>}
   */
  async cancelOTLByTransactionHash(transactionHash: string, txCallbacks: {} = {}): Promise<TransactionReceipt> {
    const { logs } = await this.getReceiptWithLogs(transactionHash)
    const paymentDepositLog = logs.filter(({ name }) => name === 'PaymentDeposit')[0]

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
    const cancelOtlCall = this.oneTimePaymentsContract.methods.cancel(hashedCode)
    return this.sendTransaction(cancelOtlCall, txCallbacks)
  }

  handleError(e: Error) {
    log.error('handleError', e.message, e)
    throw e
  }

  async getGasPrice(): Promise<number> {
    let gasPrice = this.gasPrice

    try {
      const networkGasPrice = await this.wallet.eth.getGasPrice().then(toBN)

      if (networkGasPrice.gt(toBN('0'))) {
        gasPrice = networkGasPrice.toString()
      }
    } catch (e) {
      log.error('failed to retrieve gas price from network', e.message, e)
    }

    return gasPrice
  }

  async sendAmount(to: string, amount: number, callbacks: PromiEvents): Promise<TransactionReceipt> {
    if (!this.wallet.utils.isAddress(to)) {
      throw new Error('Address is invalid')
    }

    if (amount === 0 || !(await this.canSend(amount))) {
      throw new Error('Amount is bigger than balance')
    }

    log.info({ amount, to })
    const transferCall = this.tokenContract.methods.transfer(to, amount.toString()) // retusn TX object (not sent to the blockchain yet)

    return this.sendTransaction(transferCall, callbacks) // Send TX to the blockchain
  }

  /**
   * Helper to check if user has enough native token balance, if not try to ask server to topwallet
   * @param {number} wei
   * @param {object} options
   */
  async verifyHasGas(wei: number, options = {}) {
    try {
      const { topWallet = true } = options

      let nativeBalance = await this.balanceOfNative()
      if (nativeBalance > wei) {
        return {
          ok: true,
        }
      }

      if (topWallet) {
        log.info('no gas, asking for top wallet')
        const toppingRes = await API.verifyTopWallet()
        const { data } = toppingRes
        if (data.ok !== 1) {
          return {
            ok: false,
            error: (data.error && !~data.error.indexOf(`User doesn't need topping`)) || data.sendEtherOutOfSystem,
          }
        }
        nativeBalance = await this.balanceOfNative()
        return {
          ok: data.ok && nativeBalance > wei,
        }
      }

      return {
        ok: false,
      }
    } catch (e) {
      log.error('verifyHasGas:', e.message, e, { wei })
      return {
        ok: false,
        error: false,
      }
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
    { gas: setgas, gasPrice }: GasValues = { gas: undefined, gasPrice: undefined }
  ) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = { ...defaultPromiEvents, ...txCallbacks }
    let gas = setgas || (await tx.estimateGas())
    gasPrice = gasPrice || this.gasPrice
    if (Config.network === 'develop' && setgas === undefined) {
      gas *= 2
    }
    log.debug({ gas, gasPrice })
    const { ok } = await this.verifyHasGas(gas * gasPrice)
    if (ok === false) {
      return Promise.reject('Reached daily transactions limit or not a citizen').catch(this.handleError)
    }
    const res = new Promise((res, rej) => {
      tx.send({ gas, gasPrice, chainId: this.networkId })
        .on('transactionHash', h => {
          log.debug('got txhash', h)
          onTransactionHash && onTransactionHash(h)
        })
        .on('receipt', r => {
          log.debug('got receipt', r)
          res(r)
          onReceipt && onReceipt(r)
        })
        .on('confirmation', c => {
          log.debug('got confirmation', c)
          onConfirmation && onConfirmation(c)
        })
        .on('error', e => {
          log.error('sendTransaction error:', e.message, e, { tx })
          rej(e)
          onError && onError(e)
        })
    })
    return res

    /** receipt handling happens already in polling events */
    // .then(async receipt => {
    //   const transactionReceipt = await this.getReceiptWithLogs(receipt.transactionHash)
    //   await this.sendReceiptWithLogsToSubscribers(transactionReceipt, ['receiptReceived', 'receiptUpdated'])
    //   return transactionReceipt
    // })
    // .catch(this.handleError)
  }
}

export const WalletType = GoodWallet.WalletType
export type AccountUsage = $Keys<typeof GoodWallet.AccountUsageToPath>
