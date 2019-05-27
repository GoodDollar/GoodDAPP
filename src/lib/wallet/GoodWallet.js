// @flow
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.min.json'
import ReserveABI from '@gooddollar/goodcontracts/build/contracts/GoodDollarReserve.min.json'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.min.json'
import OneTimePaymentLinksABI from '@gooddollar/goodcontracts/build/contracts/OneTimePaymentLinks.min.json'
import RedemptionABI from '@gooddollar/goodcontracts/build/contracts/RedemptionFunctional.min.json'
import ContractsAddress from '@gooddollar/goodcontracts/releases/deployment.json'
import { default as filterFunc } from 'lodash/filter'
import type Web3 from 'web3'
import { BN, toBN } from 'web3-utils'
import uniqBy from 'lodash/uniqBy'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import { generateShareLink } from '../share'
import WalletFactory from './WalletFactory'
import abiDecoder from 'abi-decoder'
import values from 'lodash/values'
import get from 'lodash/get'

const log = logger.child({ from: 'GoodWallet' })

const ZERO = new BN('0')

type PromiEvents = {
  onTransactionHash?: Function,
  onReceipt?: Function,
  onConfirmation?: Function,
  onError?: Function
}

type GasValues = {
  gas?: number,
  gasPrice?: number
}

/**
 * the HDWallet account to use.
 * we use different accounts for different actions in order to preserve privacy and simplify things for user
 * in background
 */

type QueryEvent = {
  event: string,
  contract: Web3.eth.Contract,
  filterPred: {},
  fromBlock: typeof BN,
  toBlock?: typeof BN | 'latest'
}

const defaultPromiEvents: PromiEvents = {
  onTransactionHash: () => {},
  onReceipt: () => {},
  onConfirmation: () => {},
  onError: () => {}
}

export class GoodWallet {
  static WalletType = 'software'
  static AccountUsageToPath = {
    gd: 0,
    gundb: 1,
    eth: 2,
    donate: 3,
    login: 4,
    zoomId: 5
  }
  ready: Promise<Web3>
  wallet: Web3
  accountsContract: Web3.eth.Contract
  tokenContract: Web3.eth.Contract
  identityContract: Web3.eth.Contract
  claimContract: Web3.eth.Contract
  reserveContract: Web3.eth.Contract
  oneTimePaymentLinksContract: Web3.eth.Contract
  account: string
  accounts: Array<string>
  networkId: number
  gasPrice: number
  subscribers: any = {}

  constructor() {
    this.init()
  }

  /**
   * Subscribes to Transfer events (from and to) the current account
   * This is used to verify account balance changes
   * @param fromBlock - defaultValue: '0'
   * @returns {Promise<R>|Promise<R|*>|Promise<*>}
   */
  listenTxUpdates(fromBlock: string = '0') {
    log.debug('listening from block:', fromBlock)
    fromBlock = new BN(fromBlock)

    this.pollForEvents(
      {
        event: 'Transfer',
        contract: this.tokenContract,
        fromBlock,
        filterPred: { from: this.wallet.utils.toChecksumAddress(this.account) }
      },
      async (error, events) => {
        log.debug('send events', { error, events })
        const uniqEvents = uniqBy(events, 'transactionHash')
        uniqEvents.forEach(event => {
          this.getReceiptWithLogs(event.transactionHash)
            .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptUpdated']))
            .catch(err => log.error(err))
        })
        // Send for all events. We could define here different events
        this.getSubscribers('send').forEach(cb => cb(error, events))
        this.getSubscribers('balanceChanged').forEach(cb => cb(error, events))
      }
    )

    this.pollForEvents(
      {
        event: 'Transfer',
        contract: this.tokenContract,
        fromBlock,
        filterPred: { to: this.wallet.utils.toChecksumAddress(this.account) }
      },
      async (error, events) => {
        log.debug('receive events', { error, events })
        const uniqEvents = uniqBy(events, 'transactionHash')
        uniqEvents.forEach(event => {
          this.getReceiptWithLogs(event.transactionHash)
            .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptReceived']))
            .catch(err => log.error(err))
        })

        this.getSubscribers('receive').forEach(cb => cb(error, events))
        this.getSubscribers('balanceChanged').forEach(cb => cb(error, events))
      }
    )
  }

  async getReceiptWithLogs(transactionHash: string) {
    const transactionReceipt = await this.wallet.eth.getTransactionReceipt(transactionHash)
    if (!transactionReceipt) return null

    const logs = abiDecoder.decodeLogs(transactionReceipt.logs)
    const receipt = { ...transactionReceipt, logs }
    return receipt
  }

  sendReceiptWithLogsToSubscribers(receipt: any, subscriptions: Array<string>) {
    subscriptions.forEach(subscription => {
      this.getSubscribers(subscription).forEach(cb => cb(receipt))
    })
    return receipt
  }

  init(): Promise<any> {
    const ready = WalletFactory.create(GoodWallet.WalletType)
    this.ready = ready
      .then(async wallet => {
        this.wallet = wallet
        this.accounts = this.wallet.eth.accounts.wallet
        this.account = this.getAccountForType('gd')
        this.wallet.eth.defaultAccount = this.account
        this.networkId = ContractsAddress[Config.network].networkId
        this.network = Config.network
        log.info(`networkId: ${this.networkId}`)
        this.gasPrice = wallet.utils.toWei('1', 'gwei')
        this.wallet.eth.defaultGasPrice = this.gasPrice
        this.identityContract = new this.wallet.eth.Contract(
          IdentityABI.abi,
          get(ContractsAddress, `${this.network}.Identity`, IdentityABI.networks[this.networkId].address),
          { from: this.account }
        )
        this.claimContract = new this.wallet.eth.Contract(
          RedemptionABI.abi,
          get(ContractsAddress, `${this.network}.RedemptionFunctional`, RedemptionABI.networks[this.networkId].address),

          { from: this.account }
        )
        this.tokenContract = new this.wallet.eth.Contract(
          GoodDollarABI.abi,
          get(ContractsAddress, `${this.network}.GoodDollar`, GoodDollarABI.networks[this.networkId].address),
          { from: this.account }
        )
        abiDecoder.addABI(GoodDollarABI.abi)
        this.reserveContract = new this.wallet.eth.Contract(
          ReserveABI.abi,
          get(ContractsAddress, `${this.network}.GoodDollarReserve`, ReserveABI.networks[this.networkId].address),
          {
            from: this.account
          }
        )
        this.oneTimePaymentLinksContract = new this.wallet.eth.Contract(
          OneTimePaymentLinksABI.abi,
          get(
            ContractsAddress,
            `${this.network}.OneTimePaymentLinks`,
            OneTimePaymentLinksABI.networks[this.networkId].address
          ),
          {
            from: this.account
          }
        )
        abiDecoder.addABI(OneTimePaymentLinksABI.abi)
        log.info('GoodWallet Ready.', { account: this.account })
      })
      .catch(e => {
        log.error('Failed initializing GoodWallet', e)
        throw e
      })
    return this.ready
  }

  async deleteAccount(): Promise<> {
    return this.sendTransaction(this.identityContract.methods.renounceWhitelisted())
  }
  async claim(): Promise<TransactionReceipt> {
    try {
      return this.sendTransaction(this.claimContract.methods.claimTokens())
    } catch (e) {
      log.info(e)
      return Promise.reject(e)
    }
  }

  async checkEntitlement(): Promise<number> {
    return await this.claimContract.methods.checkEntitlement().call()
  }

  /**
   * Sets an id and place a callback function for this id, for the sent event
   * @dev event can have multiple subscribers, each one recieves it's own id
   * @return {object} subscriber id and eventName
   * @dev so consumer can unsubscribe using id and event name
   */
  subscribeToEvent(eventName: string, cb: Function) {
    // Get last id from subscribersList
    if (!this.subscribers[eventName]) {
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
  async balanceChanged(cb: Function) {
    this.subscribeToEvent('balanceChanged', cb)
  }

  /**
   * Retrieves current Block Number and returns it as converted to a BN instance
   * @returns {Promise<BN>} - Current block number in BN instance
   */
  getBlockNumber(): Promise<BN> {
    return this.wallet.eth.getBlockNumber().then(toBN)
  }

  /**
   * Client side event filter. Requests all events for a particular contract, then filters them and returns the event Object
   * @param {String} event - Event to subscribe to
   * @param {Object} contract - Contract from which event will be queried
   * @param {Object} filterPred - Event's filter. Does not required to be indexed as it's filtered locally
   * @param {BN} fromBlock - Lower blocks range value
   * @param {BN} toBlock - Higher blocks range value
   * @returns {Promise<*>}
   */
  async getEvents({ event, contract, filterPred, fromBlock = ZERO, toBlock }: QueryEvent): Promise<[]> {
    const events = await contract.getPastEvents('allEvents', { fromBlock, toBlock })
    const res1 = filterFunc(events, { event })
    const res = filterFunc(res1, { returnValues: { ...filterPred } })
    log.debug({ res, events, res1, fromBlock: fromBlock.toString(), toBlock: toBlock && toBlock.toString() })

    return res
  }

  /**
   * Subscribes to a particular event and returns the result based on options specified
   * @param {String} event - Event to subscribe to
   * @param {Object} contract - Contract from which event will be queried
   * @param {Object} filterPred - Event's filter. Does not required to be indexed as it's filtered locally
   * @param {BN} fromBlock - Lower blocks range value
   * @param {BN} toBlock - Higher blocks range value
   * @param {Function} callback - Function to be called once an event is received
   * @returns {Promise<void>}
   */
  async oneTimeEvents({ event, contract, filterPred, fromBlock, toBlock }: QueryEvent, callback?: Function) {
    try {
      const events = await this.getEvents({ event, contract, filterPred, fromBlock, toBlock })
      log.debug({ events: events.length, ...filterPred, fromBlock: fromBlock.toString(), toBlock: toBlock.toString() })

      if (events.length) {
        if (callback === undefined) {
          return Promise.resolve(events)
        } else {
          callback(null, events)
        }
      }
    } catch (e) {
      log.error({ e })

      if (callback === undefined) {
        return Promise.reject(e)
      } else {
        callback(e, [])
      }
    }
  }

  /**
   * Polls for events every INTERVAL defined by BLOCK_TIME and BLOCK_COUNT, the result is based on specified options
   * It queries the range 'fromBlock'-'toBlock' and then continues querying the blockchain for most recent events, from
   * the 'lastProcessedBlock' to the 'latest' every INTERVAL
   * @param {String} event - Event to subscribe to
   * @param {Object} contract - Contract from which event will be queried
   * @param {Object} filterPred - Event's filter. Does not required to be indexed as it's filtered locally
   * @param {BN} fromBlock - Lower blocks range value
   * @param {BN} toBlock - Higher blocks range value
   * @param {Function} callback - Function to be called once an event is received
   * @param {BN} lastProcessedBlock - Used for recursion. It's not required to be set by the user. Initial value: ZERO
   * @returns {Promise<void>}
   */
  async pollForEvents({ event, contract, filterPred, fromBlock, toBlock }: QueryEvent, callback: Function) {
    const BLOCK_TIME = 5000
    const BLOCK_COUNT = 1
    const INTERVAL = BLOCK_COUNT * BLOCK_TIME

    const lastBlock = toBlock !== undefined ? toBlock : await this.getBlockNumber()
    fromBlock = fromBlock !== undefined ? fromBlock : ZERO

    log.trace('fromBlock', fromBlock && fromBlock.toString())
    log.trace('lastBlock', lastBlock.toString())
    log.trace('toBlock', toBlock && toBlock.toString())

    if (toBlock && toBlock.lt(lastBlock)) {
      log.trace('toBlock reached', { toBlock: toBlock.toString(), lastBlock: lastBlock.toString() })
      return
    }

    if (fromBlock && fromBlock.eq(lastBlock)) {
      log.trace('all blocks processed', { fromBlock: fromBlock.toString(), lastBlock: lastBlock.toString() })
    } else {
      await this.oneTimeEvents({ event, contract, filterPred, fromBlock, toBlock: lastBlock }, callback)
    }

    log.trace('about to recurse', {
      event,
      contract,
      filterPred,
      fromBlock: fromBlock && fromBlock.toString(),
      toBlock: toBlock && toBlock.toString(),
      lastBlock: lastBlock.toString()
    })

    setTimeout(() => {
      this.pollForEvents({ event, contract, filterPred, fromBlock: lastBlock, toBlock }, callback)
    }, INTERVAL)
  }

  async balanceOf(): Promise<number> {
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

  async isVerified(address: string): Promise<boolean> {
    const tx: boolean = await this.identityContract.methods.isVerified(address).call()
    return tx
  }

  async isCitizen(): Promise<boolean> {
    const tx: boolean = await this.identityContract.methods.isVerified(this.account).call()
    return tx
  }

  async canSend(amount: number): Promise<boolean> {
    const balance = await this.balanceOf()
    return parseInt(amount) <= parseInt(balance)
  }

  async generateLink(amount: number, reason: string = '', events: PromitEvents) {
    if (!(await this.canSend(amount))) {
      throw new Error(`Amount is bigger than balance`)
    }

    const generatedString = this.wallet.utils.randomHex(10).replace('0x', '')
    const hashedString = this.wallet.utils.sha3(generatedString)
    const otpAddress = get(
      ContractsAddress,
      `${this.network}.OneTimePaymentLinks`,
      OneTimePaymentLinksABI.networks[this.networkId].address
    )

    const deposit = this.oneTimePaymentLinksContract.methods.deposit(this.account, hashedString, amount)
    const encodedABI = await deposit.encodeABI()

    const transferAndCall = this.tokenContract.methods.transferAndCall(otpAddress, amount, encodedABI)
    //Fixed gas amount so it can work locally with ganache
    //https://github.com/trufflesuite/ganache-core/issues/417
    const gas: number = 200000 //Math.floor((await transferAndCall.estimateGas().catch(this.handleError)) * 2)

    log.debug('generateLiknk:', { amount })

    const sendLink = generateShareLink('send', {
      receiveLink: generatedString,
      reason
    })

    const onTransactionHash = events.onTransactionHash({ sendLink, generatedString })
    const receipt = await this.sendTransaction(transferAndCall, { onTransactionHash }, { gas })

    return {
      generatedString,
      hashedString,
      sendLink,
      receipt
    }
  }

  getWithdrawLink(otlCode: string) {
    const { sha3 } = this.wallet.utils
    return sha3(otlCode)
  }

  async isWithdrawLinkUsed(link: string) {
    const { isLinkUsed } = this.oneTimePaymentLinksContract.methods
    return await isLinkUsed(link).call()
  }

  isWithdrawPaymentAvailable(payment: any) {
    return payment.lte(ZERO)
  }

  getWithdrawAvailablePayment(link: string) {
    const { payments } = this.oneTimePaymentLinksContract.methods
    const { toBN } = this.wallet.utils

    return payments(link)
      .call()
      .then(toBN)
  }

  async getWithdrawStatus(otlCode: string) {
    const link = this.getWithdrawLink(otlCode)

    // Check link availability
    const linkUsed = await this.isWithdrawLinkUsed(link)
    if (linkUsed) return 'Completed'

    // Check payment availability
    const paymentAvailable = await this.getWithdrawAvailablePayment(link)
    if (this.isWithdrawPaymentAvailable(paymentAvailable)) return 'Cancelled'

    return 'Pending'
  }

  //FIXME: what's this for? why does it read events from block0
  async canWithdraw(otlCode: string) {
    const { senders } = this.oneTimePaymentLinksContract.methods

    const link = this.getWithdrawLink(otlCode)

    // Check link availability
    const linkUsed = await this.isWithdrawLinkUsed(link)
    if (!linkUsed) throw new Error('invalid link')

    // Check payment availability
    const paymentAvailable = await this.getWithdrawAvailablePayment(link)
    if (this.isWithdrawPaymentAvailable(paymentAvailable)) throw new Error('deposit already withdrawn')

    const sender = await senders(link).call()
    return {
      amount: paymentAvailable.toString(),
      sender
    }
  }

  async withdraw(otlCode: string, promiEvents: ?PromiEvents) {
    const withdrawCall = this.oneTimePaymentLinksContract.methods.withdraw(otlCode)
    log.info('withdrawCall', withdrawCall)
    return await this.sendTransaction(withdrawCall, { ...defaultPromiEvents, ...promiEvents })
  }

  async cancelOtl(otlCode: string) {
    const cancelOtlCall = this.oneTimePaymentLinksContract.methods.cancel(otlCode)
    log.info('cancelOtlCall', cancelOtlCall)

    return await this.sendTransaction(cancelOtlCall, { onTransactionHash: hash => log.debug({ hash }) })
  }

  handleError(err: Error) {
    log.error('handleError', { err })
    throw err
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
      log.error('failed to retrieve gas price from network', { e })
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

    return await this.sendTransaction(transferCall, events) // Send TX to the blockchain
  }

  /**
   * Helper function to handle a tx Send call
   * @param tx
   * @param {object} promiEvents
   * @param {function} promiEvents.onTransactionHash
   * @param {function} promiEvents.onReceipt
   * @param {function} promiEvents.onConfirmation
   * @param {function} promiEvents.onError
   * @param {object} gasValues
   * @param {number} gasValues.gas
   * @param {number} gasValues.gasPrice
   * @returns {Promise<Promise|Q.Promise<any>|Promise<*>|Promise<*>|Promise<*>|*>}
   */
  async sendTransaction(
    tx: any,
    txCallbacks: PromiEvents = defaultPromiEvents,
    { gas, gasPrice }: GasValues = { gas: undefined, gasPrice: undefined }
  ) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = { ...defaultPromiEvents, ...txCallbacks }
    gas = gas || (await tx.estimateGas().catch(this.handleError))
    gasPrice = gasPrice || this.gasPrice

    log.debug({ gas, gasPrice })

    return (
      new Promise((res, rej) => {
        tx.send({ gas, gasPrice, chainId: this.networkId })
          .on('transactionHash', onTransactionHash)
          .on('receipt', r => {
            onReceipt && onReceipt(r)
            res(r)
          })
          .on('confirmation', onConfirmation)
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
export default new GoodWallet()
