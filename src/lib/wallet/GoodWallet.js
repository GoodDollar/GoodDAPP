// @flow
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.json'
import ReserveABI from '@gooddollar/goodcontracts/build/contracts/GoodDollarReserve.json'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.json'
import OneTimePaymentLinksABI from '@gooddollar/goodcontracts/build/contracts/OneTimePaymentLinks.json'
import RedemptionABI from '@gooddollar/goodcontracts/build/contracts/RedemptionFunctional.json'
import _ from 'lodash'
import type Web3 from 'web3'
import { utils } from 'web3'

import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import WalletFactory from './WalletFactory'
import abiDecoder from 'abi-decoder'

const log = logger.child({ from: 'GoodWallet' })

const { BN, toBN } = utils
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
const AccountUsageToPath = {
  gd: 0,
  gundb: 1,
  eth: 2,
  donate: 3
}

export type AccountUsage = $Keys<typeof AccountUsageToPath>

type QueryEvent = {
  event: string,
  contract: Web3.eth.Contract,
  filter: {},
  fromBlock: typeof BN,
  toBlock: typeof BN | 'latest'
}

export class GoodWallet {
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
  subscribers: any

  constructor() {
    this.init()
  }

  listenTxUpdates() {
    this.subscribers = {}
    this.wallet.eth
      .getBlockNumber()
      .then(toBN)
      .then(toBlock => {
        this.pollForEvents(
          {
            event: 'Transfer',
            contract: this.tokenContract,
            fromBlock: new BN('0'),
            toBlock,
            filter: { from: this.account }
          },
          async (error, events) => {
            log.debug({ error, events }, 'send')
            const [event] = events
            if (!event) {
              log.error('no event', events)
              return
            }
            this.wallet.eth.getTransactionReceipt(event.transactionHash).then(receipt => {
              const logs = abiDecoder.decodeLogs(receipt.logs)
              this.getSubscribers('receiptUpdated').forEach(cb => cb({ ...receipt, logs }))
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
            fromBlock: new BN('0'),
            toBlock,
            filter: { to: this.account }
          },
          async (error, events) => {
            log.debug({ error, events }, 'receive')
            const [event] = events
            if (!event) {
              log.error('no event', events)
              return
            }
            this.wallet.eth
              .getTransactionReceipt(event.transactionHash)
              .then(receipt => {
                const logs = abiDecoder.decodeLogs(receipt.logs)
                this.getSubscribers('receiptReceived').forEach(cb => cb({ ...receipt, logs }))
              })
              .catch(err => log.error(err))

            this.getSubscribers('receive').forEach(cb => cb(error, events))
            this.getSubscribers('balanceChanged').forEach(cb => cb(error, events))
          }
        )
      })
  }

  init(): Promise<any> {
    const ready = WalletFactory.create('software')
    this.ready = ready
      .then(wallet => {
        this.wallet = wallet
        this.account = this.wallet.eth.defaultAccount
        this.accounts = this.wallet.eth.accounts.wallet
        this.networkId = Config.networkId
        this.gasPrice = wallet.utils.toWei('1', 'gwei')
        this.identityContract = new this.wallet.eth.Contract(
          IdentityABI.abi,
          IdentityABI.networks[this.networkId].address,
          { from: this.account }
        )
        this.claimContract = new this.wallet.eth.Contract(
          RedemptionABI.abi,
          RedemptionABI.networks[this.networkId].address,
          { from: this.account }
        )
        this.tokenContract = new this.wallet.eth.Contract(
          GoodDollarABI.abi,
          GoodDollarABI.networks[this.networkId].address,
          { from: this.account }
        )
        abiDecoder.addABI(GoodDollarABI.abi)
        this.reserveContract = new this.wallet.eth.Contract(
          ReserveABI.abi,
          ReserveABI.networks[this.networkId].address,
          {
            from: this.account
          }
        )
        this.oneTimePaymentLinksContract = new this.wallet.eth.Contract(
          OneTimePaymentLinksABI.abi,
          OneTimePaymentLinksABI.networks[this.networkId].address,
          {
            from: this.account
          }
        )
        this.listenTxUpdates()
        log.info('GoodWallet Ready.')
      })
      .catch(e => {
        log.error('Failed initializing GoodWallet', e)
        throw e
      })
    return this.ready
  }

  async claim() {
    try {
      return this.sendTransaction(this.claimContract.methods.claimTokens())
    } catch (e) {
      log.info(e)
      return Promise.reject(e)
    }
  }

  async checkEntitlement() {
    return await this.claimContract.methods.checkEntitlement().call()
  }

  /**
   * returns id+eventName so consumer can unsubscribe
   */
  subscribeToEvent(eventName: string, cb: Function) {
    // Get last id from subscribersList
    if (!this.subscribers[eventName]) {
      this.subscribers[eventName] = {}
    }
    const subscribers = this.subscribers[eventName]
    const id = Math.max(...Object.keys(subscribers).map(parseInt), 0) + 1
    this.subscribers[eventName][id] = cb
    return { id, eventName }
  }

  /**
   * removes subscriber from subscriber list
   * @param {event} event
   */
  unSubscribeToTx({ eventName, id }: { eventName: string, id: number }) {
    delete this.subscribers[eventName][id]
  }

  /**
   * Gets all subscribers as array for given eventName
   * @param {string} eventName
   */
  getSubscribers(eventName: string): Function {
    return Object.values(this.subscribers[eventName] || {})
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
   * Client side event filter. Requests all events for a particular contract, then filters them and returns the event Object
   * @param {String} event - Event to subscribe to
   * @param {Object} contract - Contract from which event will be queried
   * @param {Object} filter - Event's filter. Does not required to be indexed as it's filtered locally
   * @param {BN} fromBlock - Lower blocks range value
   * @param {BN} toBlock - Higher blocks range value
   * @returns {Promise<*>}
   */
  async getEvents({ event, contract, filter, fromBlock = ZERO, toBlock }: QueryEvent): Promise<[]> {
    const events = await contract.getPastEvents('allEvents', { fromBlock, toBlock })

    return _(events)
      .filter({ event })
      .filter({ returnValues: { ...filter } })
      .value()
  }

  /**
   * Subscribes to a particular event and returns the result based on options specified
   * @param {String} event - Event to subscribe to
   * @param {Object} contract - Contract from which event will be queried
   * @param {Object} filter - Event's filter. Does not required to be indexed as it's filtered locally
   * @param {BN} fromBlock - Lower blocks range value
   * @param {BN} toBlock - Higher blocks range value
   * @param {Function} callback - Function to be called once an event is received
   * @returns {Promise<void>}
   */
  async oneTimeEvents({ event, contract, filter, fromBlock, toBlock }: QueryEvent, callback?: Function) {
    try {
      const events = await this.getEvents({ event, contract, filter, fromBlock, toBlock })
      log.debug({ events: events.length, ...filter, fromBlock: fromBlock.toString(), toBlock: toBlock.toString() })

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
   * @param {Object} filter - Event's filter. Does not required to be indexed as it's filtered locally
   * @param {BN} fromBlock - Lower blocks range value
   * @param {BN} toBlock - Higher blocks range value
   * @param {Function} callback - Function to be called once an event is received
   * @param {BN} lastProcessedBlock - Used for recursion. It's not required to be set by the user. Initial value: ZERO
   * @returns {Promise<void>}
   */
  async pollForEvents(
    { event, contract, filter, fromBlock, toBlock }: QueryEvent,
    callback: Function,
    lastProcessedBlock: typeof BN = ZERO
  ) {
    const BLOCK_TIME = 5000
    const BLOCK_COUNT = 1
    const INTERVAL = BLOCK_COUNT * BLOCK_TIME
    const lastBlock = await this.wallet.eth.getBlockNumber().then(toBN)

    log.debug('lastProcessedBlock', lastProcessedBlock.toString())
    log.debug('lastBlock', lastBlock.toString())
    if (lastProcessedBlock.lt(lastBlock)) {
      fromBlock = toBlock
      toBlock = lastBlock
      await this.oneTimeEvents({ event, contract, filter, fromBlock, toBlock }, callback)
    } else {
      log.debug('all blocks processed', {
        toBlock: toBlock.toString(),
        lastBlock: lastBlock.toString()
      })
    }

    log.debug('about to recurse', { event, contract, filter, fromBlock, toBlock })
    setTimeout(() => this.pollForEvents({ event, contract, filter, fromBlock, toBlock }, callback, toBlock), INTERVAL)
  }

  async balanceOf() {
    return this.tokenContract.methods.balanceOf(this.account).call()
  }

  signMessage() {}

  sendTx() {}

  async getAccountForType(type: AccountUsage) {
    let account = this.accounts[AccountUsageToPath[type]].address || this.account
    return account
  }

  async sign(toSign: string, accountType: AccountUsage = 'gd') {
    let account = await this.getAccountForType(accountType)
    return this.wallet.eth.sign(toSign, account)
  }

  async isVerified(address: string): Promise<boolean> {
    const tx: boolean = await this.identityContract.methods.isVerified(address).call()
    return tx
  }

  async isCitizen(): Promise<boolean> {
    const tx: boolean = await this.identityContract.methods.isVerified(this.account).call()
    return tx
  }

  async canSend(amount: number) {
    const balance = await this.balanceOf()
    return amount < balance
  }

  async generateLink(amount: number, reason: string = '', events: PromitEvents) {
    if (!(await this.canSend(amount))) {
      throw new Error(`Amount is bigger than balance`)
    }

    const generatedString = this.wallet.utils.randomHex(10).replace('0x', '')
    const hashedString = this.wallet.utils.sha3(generatedString)
    const otpAddress = OneTimePaymentLinksABI.networks[this.networkId].address

    const deposit = this.oneTimePaymentLinksContract.methods.deposit(this.account, hashedString, amount)
    const encodedABI = await deposit.encodeABI()

    const transferAndCall = this.tokenContract.methods.transferAndCall(otpAddress, amount, encodedABI)

    const gas: number = Math.floor((await transferAndCall.estimateGas().catch(this.handleError)) * 2)

    log.info({ amount })

    const sendLink = `${Config.publicUrl}/AppNavigation/Dashboard/Home?receiveLink=${generatedString}&reason=${reason}`

    const onTransactionHash = events.onTransactionHash(sendLink)
    const receipt = await this.sendTransaction(transferAndCall, { onTransactionHash }, { gas })

    return {
      generatedString,
      hashedString,
      sendLink,
      receipt
    }
  }

  async canWithdraw(otlCode: string) {
    const { isLinkUsed, payments } = this.oneTimePaymentLinksContract.methods
    const { sha3, toBN } = this.wallet.utils

    const link = sha3(otlCode)
    const linkUsed = await isLinkUsed(link).call()
    log.info('isLinkUsed', linkUsed)

    if (!linkUsed) {
      throw new Error('invalid link')
    }

    const paymentAvailable = await payments(link)
      .call()
      .then(toBN)
    log.info(`paymentAvailable: ${paymentAvailable}`)

    if (paymentAvailable.lte(toBN('0'))) {
      throw new Error('deposit already withdrawn')
    }

    const events = await this.oneTimeEvents({
      event: 'PaymentDeposit',
      contract: this.oneTimePaymentLinksContract,
      fromBlock: '0',
      toBlock: 'latest',
      filter: { hash: link }
    })

    log.debug({ events })

    const { from } = _(events)
      .filter({ returnValues: { hash: link } })
      .map('returnValues')
      .value()[0]

    return {
      amount: paymentAvailable.toString(),
      sender: from
    }
  }

  async withdraw(otlCode: string) {
    const withdrawCall = this.oneTimePaymentLinksContract.methods.withdraw(otlCode)
    log.info('withdrawCall', withdrawCall)

    return await this.sendTransaction(withdrawCall, { onTransactionHash: hash => log.debug({ hash }) })
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

  async getGasPrice() {
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

  async sendAmount(to: string, amount: number, events: PromiEvents) {
    if (!this.wallet.utils.isAddress(to)) {
      throw new Error('Address is invalid')
    }

    if (amount === 0 || !(await this.canSend(amount))) {
      throw new Error('Amount is bigger than balance')
    }

    log.debug({ amount, to })
    const transferCall = this.tokenContract.methods.transfer(to, amount)

    return await this.sendTransaction(transferCall, events)
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
    { onTransactionHash, onReceipt, onConfirmation, onError }: PromiEvents = {
      onTransactionHash: () => {},
      onReceipt: () => {},
      onConfirmation: () => {},
      onError: () => {}
    },
    { gas, gasPrice }: GasValues = { gas: undefined, gasPrice: undefined }
  ) {
    gas = gas || (await tx.estimateGas().catch(this.handleError))
    gasPrice = gasPrice || (await this.getGasPrice())

    log.debug({ gas, gasPrice })

    return tx
      .send({ gas, gasPrice })
      .on('transactionHash', onTransactionHash)
      .on('receipt', onReceipt)
      .on('confirmation', onConfirmation)
      .on('error', onError)
      .catch(this.handleError)
  }
}

export default new GoodWallet()
