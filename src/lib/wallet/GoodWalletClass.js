// @flow
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.min.json'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.min.json'
import OneTimePaymentsABI from '@gooddollar/goodcontracts/build/contracts/OneTimePayments.min.json'
import ContractsAddress from '@gooddollar/goodcontracts/releases/deployment.json'
import StakingModelAddress from '@gooddollar/goodcontracts/stakingModel/releases/deployment.json'
import UpgradablesAddress from '@gooddollar/goodcontracts/upgradables/releases/deployment.json'
import ERC20ABI from '@gooddollar/goodcontracts/build/contracts/ERC20.min.json'
import UBIABI from '@gooddollar/goodcontracts/stakingModel/build/contracts/UBIScheme.min.json'
import SimpleDaiStaking from '@gooddollar/goodcontracts/stakingModel/build/contracts/SimpleDAIStaking.min.json'
import InvitesABI from '@gooddollar/goodcontracts/upgradables/build/contracts/InvitesV1.min.json'
import Web3 from 'web3'
import { BN, toBN } from 'web3-utils'
import abiDecoder from 'abi-decoder'
import { get, invokeMap, last, result, uniqBy, values } from 'lodash'
import moment from 'moment'
import bs58 from 'bs58'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import { ExceptionCategory } from '../../lib/logger/exceptions'
import API from '../../lib/API/api'
import { delay } from '../../lib/utils/async'
import { generateShareLink } from '../share'
import WalletFactory from './WalletFactory'

const log = logger.child({ from: 'GoodWallet' })

const ZERO = new BN('0')

//17280 = 24hours seconds divided by 5 seconds blocktime
const DAY_TOTAL_BLOCKS = (60 * 60 * 24) / 5

export const WITHDRAW_STATUS_PENDING = 'pending'
export const WITHDRAW_STATUS_UNKNOWN = 'unknown'
export const WITHDRAW_STATUS_COMPLETE = 'complete'

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

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
    faceVerification: 5,
  }

  ready: Promise<Web3>

  config: {}

  tokenContract: Web3.eth.Contract

  identityContract: Web3.eth.Contract

  oneTimePaymentsContract: Web3.eth.Contract

  erc20Contract: Web3.eth.Contract

  UBIContract: Web3.eth.Contract

  SimpleDaiStaking: Web3.eth.Contract

  invitesContract: Web3.eth.Contract

  account: string

  accounts: Array<string>

  networkId: number

  network: string

  gasPrice: number

  subscribers: any = {}

  isPollEvents: boolean = true

  web3Mainnet: Web3

  constructor(walletConfig: {} = {}) {
    this.config = walletConfig
    this.init()
  }

  init(): Promise<any> {
    const mainnetNetworkId = get(ContractsAddress, Config.network + '-mainnet.networkId', 122)
    const mainnethttpWeb3provider = Config.ethereum[mainnetNetworkId].httpWeb3provider
    this.web3Mainnet = new Web3(mainnethttpWeb3provider)
    const ready = WalletFactory.create(GoodWallet.WalletType, this.config)
    this.ready = ready
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
          { from: this.account },
        )

        // Token Contract
        this.tokenContract = new this.wallet.eth.Contract(
          GoodDollarABI.abi,
          get(ContractsAddress, `${this.network}.GoodDollar` /*GoodDollarABI.networks[this.networkId].address*/),
          { from: this.account },
        )
        abiDecoder.addABI(GoodDollarABI.abi)

        // ERC20 Contract
        this.erc20Contract = new this.wallet.eth.Contract(
          ERC20ABI.abi,
          get(ContractsAddress, `${this.network}.GoodDollar` /*GoodDollarABI.networks[this.networkId].address*/),
          { from: this.account },
        )
        abiDecoder.addABI(ERC20ABI.abi)

        // UBI Contract
        this.UBIContract = new this.wallet.eth.Contract(
          UBIABI.abi,
          get(StakingModelAddress, `${this.network}.UBIScheme` /*UBIABI.networks[this.networkId].address*/),
          { from: this.account },
        )
        abiDecoder.addABI(UBIABI.abi)

        this.SimpleDaiStaking = new this.web3Mainnet.eth.Contract(
          SimpleDaiStaking.abi,
          get(StakingModelAddress, `${this.network}-mainnet.DAIStaking` /*UBIABI.networks[this.networkId].address*/),
          { from: this.account },
        )
        abiDecoder.addABI(SimpleDaiStaking.abi)

        // OneTimePaymentLinks Contract
        this.oneTimePaymentsContract = new this.wallet.eth.Contract(
          OneTimePaymentsABI.abi,
          get(
            ContractsAddress,
            `${this.network}.OneTimePayments` /*OneTimePaymentsABI.networks[this.networkId].address*/,
          ),
          {
            from: this.account,
          },
        )
        abiDecoder.addABI(OneTimePaymentsABI.abi)

        // UBI Contract
        this.invitesContract = new this.wallet.eth.Contract(
          InvitesABI.abi,
          get(UpgradablesAddress, `${this.network}.Invites` /*UBIABI.networks[this.networkId].address*/),
          { from: this.account },
        )
        abiDecoder.addABI(InvitesABI.abi)

        log.info('GoodWallet Ready.', { account: this.account })
      })
      .catch(e => {
        log.error('Failed initializing GoodWallet', e.message, e, { category: ExceptionCategory.Blockhain })
        throw e
      })
    return this.ready
  }

  getRewardsAddresses() {
    const addr = get(UpgradablesAddress, `${this.network}.Invites`)
    return [addr].filter(_ => _ && _ !== NULL_ADDRESS).map(_ => _.toLowerCase())
  }

  setIsPollEvents(active) {
    this.isPollEvents = active
  }

  async pollEvents(fn, time, lastBlockCallback) {
    try {
      const run = async () => {
        if (this.isPollEvents === false) {
          return
        }
        const nextLastBlock = await this.wallet.eth.getBlockNumber()

        fn()
        this.lastEventsBlock = nextLastBlock
        lastBlockCallback(nextLastBlock)

        log.info('pollEvents success:', { nextLastBlock, lastBlockCallback })
        return true
      }

      const runRes = await Promise.race([run(), delay(5000, false)])

      if (runRes === false) {
        throw new Error('pollEvents not completed after 5 seconds')
      }
    } catch (e) {
      log.warn('pollEvents failed:', e.message, e, { category: ExceptionCategory.Blockhain })
    }
    setTimeout(() => this.pollEvents(fn, time, lastBlockCallback), time)
  }

  //eslint-disable-next-line require-await
  async watchEvents(fromBlock, lastBlockCallback) {
    this.lastEventsBlock = fromBlock
    this.pollEvents(
      () => Promise.all([this.pollSendEvents(), this.pollReceiveEvents(), this.pollOTPLEvents()]),
      5000,
      lastBlockCallback,
    )
  }

  async syncTxWithBlockchain(fromBlock) {
    const toBlock = await this.wallet.eth.getBlockNumber()
    const filter = [toBlock, fromBlock]

    log.debug('Start sync of txs from blockchain', {
      filter,
    })

    try {
      await Promise.all([
        this.pollSendEvents(...filter),
        this.pollReceiveEvents(...filter),
        this.pollOTPLEvents(...filter),
      ])

      log.debug('Sync of tx from blockchain finished successfully')
    } catch (e) {
      log.error('Failed to sync tx from blockchain', e.message, e)
    }
  }

  async pollSendEvents(toBlock, from = null) {
    const fromBlock = from || this.lastEventsBlock
    const contract = this.erc20Contract

    const fromEventsFilter = {
      fromBlock,
      toBlock,
      filter: { from: this.wallet.utils.toChecksumAddress(this.account) },
    }

    const events = await contract.getPastEvents('Transfer', fromEventsFilter).catch(e => {
      //just warn about block not  found which is recoverable
      const logFunc = e.code === -32000 ? 'warn' : 'error'
      log[logFunc]('pollSendEvents failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        fromEventsFilter,
      })
      return []
    })

    if (events.length === 0) {
      return
    }

    log.info('pollSendEvents result:', events)
    const uniqEvents = uniqBy(events, 'transactionHash')

    uniqEvents.forEach(event => {
      this.getReceiptWithLogs(event.transactionHash)
        .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptUpdated']))
        .catch(err =>
          log.error('pollSendEvents event get/send receipt failed:', err.message, err, {
            category: ExceptionCategory.Blockhain,
          }),
        )
    })

    // Send for all events. We could define here different events
    this.getSubscribers('send').forEach(cb => cb(events))
    this.getSubscribers('balanceChanged').forEach(cb => cb(events))
  }

  async pollReceiveEvents(toBlock, from = null) {
    const fromBlock = from || this.lastEventsBlock
    const contract = this.erc20Contract

    const toEventsFilter = {
      fromBlock,
      toBlock,
      filter: { to: this.wallet.utils.toChecksumAddress(this.account) },
    }

    const events = await contract.getPastEvents('Transfer', toEventsFilter).catch(e => {
      //just warn about block not  found which is recoverable
      const logFunc = e.code === -32000 ? 'warn' : 'error'
      log[logFunc]('pollReceiveEvents failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        toEventsFilter,
      })
      return []
    })
    if (events.length === 0) {
      return
    }
    log.info('pollReceiveEvents result:', events)
    const uniqEvents = uniqBy(events, 'transactionHash')

    uniqEvents.forEach(event => {
      this.getReceiptWithLogs(event.transactionHash)
        .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptReceived']))
        .catch(err =>
          log.error('pollReceiveEvents event get/send receipt failed:', err.message, err, {
            category: ExceptionCategory.Blockhain,
          }),
        )
    })

    // Send for all events. We could define here different events
    this.getSubscribers('receive').forEach(cb => cb(events))
    this.getSubscribers('balanceChanged').forEach(cb => cb(events))
  }

  async pollOTPLEvents(toBlock, from = null) {
    const fromBlock = from || this.lastEventsBlock
    const contract = this.oneTimePaymentsContract

    const fromEventsFilter = {
      fromBlock,
      toBlock,
      filter: { from: this.wallet.utils.toChecksumAddress(this.account) },
    }

    log.debug('pollOTPLEvents call', { fromEventsFilter })

    const eventsCancel = await contract.getPastEvents('PaymentCancel', Object.assign({}, fromEventsFilter)).catch(e => {
      //just warn about block not  found which is recoverable
      const logFunc = e.code === -32000 ? 'warn' : 'error'
      log[logFunc]('pollOTPLEvents failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        fromEventsFilter,
      })
      return []
    })

    // const eventsWithdraw = []
    const eventsWithdraw = await contract.getPastEvents('PaymentWithdraw', fromEventsFilter).catch(e => {
      //just warn about block not  found which is recoverable
      const logFunc = e.code === -32000 ? 'warn' : 'error'
      log[logFunc]('pollOTPLEvents failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        fromEventsFilter,
      })
      return []
    })

    const events = eventsWithdraw.concat(eventsCancel)

    if (events.length === 0) {
      return
    }

    log.info('pollOTPLEvents result', events)
    const uniqEvents = uniqBy(events, 'transactionHash')

    uniqEvents.forEach(event => {
      this.getReceiptWithLogs(event.transactionHash)
        .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['otplUpdated']))
        .catch(err =>
          log.error('pollOTPLEvents event get/send receipt failed:', err.message, err, {
            category: ExceptionCategory.Blockhain,
          }),
        )
    })
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
    log.debug('listenTxUpdates listening from block:', { fromBlock, dayAgoBlock, curBlock })
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
          log.error('listenTxUpdates fromEventsPromise failed:', error.message, error, {
            category: ExceptionCategory.Blockhain,
          })
        } else {
          log.warn('listenTxUpdates fromEventsPromise failed:', error.message, error)
        }
      } else {
        log.info('listenTxUpdates subscribed from', event)

        this.getReceiptWithLogs(event.transactionHash)
          .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptUpdated']))
          .catch(err =>
            log.error('send event get/send receipt failed:', err.message, err, {
              category: ExceptionCategory.Blockhain,
            }),
          )

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
          log.error('listenTxUpdates toEventsPromise failed:', error.message, error, {
            category: ExceptionCategory.Blockhain,
          })
        } else {
          log.warn('listenTxUpdates toEventsPromise failed:', error.message, error)
        }
      } else {
        log.info('listenTxUpdates subscribed to', event)

        this.getReceiptWithLogs(event.transactionHash)
          .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['receiptReceived']))
          .catch(err =>
            log.error('receive event get/send receipt failed:', err.message, err, {
              category: ExceptionCategory.Blockhain,
            }),
          )

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
          log.error('listenTxUpdates fromEventsPromise unexpected error:', error.message, error, {
            category: ExceptionCategory.Blockhain,
          })
        } else {
          log.warn('listenTxUpdates fromEventsPromise unexpected error:', error.message, error)
        }
      } else {
        log.info('subscribeOTPL got event', { event })

        if (event && event.event && ['PaymentWithdraw', 'PaymentCancel'].includes(event.event)) {
          this.getReceiptWithLogs(event.transactionHash)
            .then(receipt => this.sendReceiptWithLogsToSubscribers(receipt, ['otplUpdated']))
            .catch(err =>
              log.error('send event get/send receipt failed:', err.message, err, {
                category: ExceptionCategory.Blockhain,
              }),
            )
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
  async deleteAccount(): Promise<TransactionReceipt | void> {
    const canDelete = await this.identityContract.methods
      .lastAuthenticated(this.account)
      .call()
      .then(_ => _.toNumber() > 0)
      .catch(_ => true)

    if (canDelete === false) {
      return
    }
  }

  /**
   * Claims tokens for current account
   * @returns {Promise<TransactionReceipt>|Promise<Promise|Q.Promise<TransactionReceipt>|Promise<*>|*>}
   */
  claim(callbacks: PromiEvents): Promise<TransactionReceipt> {
    try {
      return this.sendTransaction(this.UBIContract.methods.claim(), callbacks)
    } catch (e) {
      log.error('claim failed', e.message, e, { category: ExceptionCategory.Blockhain })

      return Promise.reject(e)
    }
  }

  async getNextClaimTime(): Promise<any> {
    try {
      const hasClaim = await this.checkEntitlement()
        .then(_ => _.toNumber())
        .catch(e => 0)

      //if has current available amount to claim then he can claim  immediatly
      if (hasClaim > 0) {
        return [0, hasClaim]
      }

      const startRef = await this.UBIContract.methods.periodStart.call().then(_ => moment(_.toNumber() * 1000).utc())
      const curDay = await this.UBIContract.methods.currentDay.call().then(_ => _.toNumber())
      if (startRef.isBefore(moment().utc())) {
        startRef.add(curDay + 1, 'days')
      }
      return [startRef.valueOf(), 0]
    } catch (e) {
      log.error('getNextClaimTime failed', e.message, e, { category: ExceptionCategory.Blockhain })
      return Promise.reject(e)
    }
  }

  async getAmountAndQuantityClaimedToday(): Promise<any> {
    try {
      const ubiStart = await this.UBIContract.methods
        .periodStart()
        .call()
        .then(_ => _.toNumber() * 1000)
      const today = moment().diff(ubiStart, 'days')

      //we dont use getDailyStats because it returns stats for last day where claim happened
      //if user is the first the stats he says are incorrect and will reset once he claims
      const stats = await Promise.all([
        this.UBIContract.methods.getClaimerCount(today).call(),
        this.UBIContract.methods.getClaimAmount(today).call(),
      ])
      const [people, amount] = invokeMap(stats || [ZERO, ZERO], 'toNumber')

      return { amount, people }
    } catch (e) {
      log.error('getAmountAndQuantityClaimedToday failed', e.message, e, { category: ExceptionCategory.Blockhain })

      return Promise.reject(e)
    }
  }

  checkEntitlement(): Promise<number> {
    try {
      return this.UBIContract.methods.checkEntitlement().call()
    } catch (exception) {
      const { message } = exception

      log.warn('checkEntitlement failed', message, exception)
      return 0
    }
  }

  async getActiveClaimers(): Promise<number> {
    try {
      const activeUsersCount = await this.UBIContract.methods.activeUsersCount().call()
      return activeUsersCount.toNumber()
    } catch (exception) {
      const { message } = exception

      log.warn('getActiveClaimers failed', message, exception)
      throw exception
    }
  }

  // eslint-disable-next-line require-await
  async getAvailableDistribution(): Promise<number> {
    try {
      return this.UBIContract.methods
        .dailyCyclePool()
        .call()
        .then(_ => _.toNumber())
    } catch (exception) {
      const { message } = exception
      log.warn('getTodayDistribution failed', message, exception)
      throw exception
    }
  }

  async getTotalFundsStaked(): Promise<number> {
    try {
      let totalFundsStaked = await this.SimpleDaiStaking.methods.totalStaked().call()
      return this.web3Mainnet.utils.fromWei(totalFundsStaked.toString())
    } catch (exception) {
      const { message } = exception
      log.warn('getTotalFundsStaked failed', message, exception)
      throw exception
    }
  }

  async getInterestCollected(): Promise<number> {
    try {
      const toBlock = await this.web3Mainnet.eth.getBlockNumber()
      const fromBlock = parseInt(toBlock) - parseInt(Config.interestCollectedInterval)
      const InterestCollectedEventsFilter = {
        fromBlock,
        toBlock,
      }

      const events = await this.SimpleDaiStaking.getPastEvents(
        'InterestCollected',
        InterestCollectedEventsFilter,
      ).catch(e => {
        //just warn about block not  found which is recoverable
        const logFunc = e.code === -32000 ? log.warn : log.error
        logFunc('InterestCollectedEvents failed:', e.message, e, {
          category: ExceptionCategory.Blockhain,
        })
        return []
      })
      let interest = result(last(events), 'returnValues.daiValue.toString', '0')
      interest = this.web3Mainnet.utils.fromWei(interest)
      return interest
    } catch (exception) {
      const { message } = exception
      log.warn('getInterestCollected failed', message, exception)
      throw exception
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
   * Retrieves current Block Number and returns it
   * @returns {Promise<number>} - Current block number
   */
  getBlockNumber(): Promise<number> {
    return this.wallet.eth.getBlockNumber()
  }

  async balanceOf(): Promise<number> {
    try {
      const balance = await this.tokenContract.methods.balanceOf(this.account).call()
      const balanceValue = toBN(balance)

      return balanceValue.toNumber()
    } catch (exception) {
      const { message } = exception

      log.warn('BalanceOf failed', message, exception)
      throw exception
    }
  }

  async balanceOfNative(): Promise<number> {
    const { wallet, account } = this

    try {
      const balance = await wallet.eth.getBalance(account)
      const balanceValue = parseInt(balance)

      if (isNaN(balanceValue)) {
        throw new Error(`Invalid balance value '${balance}'`)
      }

      return balanceValue
    } catch (exception) {
      const { message } = exception

      log.warn('balanceOfNative failed', message, exception)
      throw exception
    }
  }

  signMessage() {}

  sendTx() {}

  getAccountForType(type: AccountUsage): string {
    const { defaultAccount } = get(this.wallet, 'eth', {})
    const accountPath = GoodWallet.AccountUsageToPath[type]
    const account = get(this.accounts, [accountPath, 'address'], defaultAccount)

    return account ? account.toString() : ''
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
    try {
      return this.identityContract.methods.isWhitelisted(address).call()
    } catch (exception) {
      const { message } = exception

      log.warn('isVerified failed', message, exception)
      throw exception
    }
  }

  lastVerified(): Promise<Date> {
    try {
      return this.identityContract.methods
        .dateAdded(this.account)
        .call()
        .then(_ => _.toNumber())
        .then(_ => new Date(_ * 1000))
    } catch (exception) {
      const { message } = exception

      log.warn('lastVerified failed', message, exception)
      throw exception
    }
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
   * @returns {Promise<number>}
   */
  async getTxFee(): Promise<number> {
    try {
      const { 0: fee, 1: senderPays } = await this.tokenContract.methods.getFees(1).call()
      return senderPays ? toBN(fee) : ZERO
    } catch (exception) {
      const { message } = exception

      log.warn('getTxFee failed', message, exception)
      throw exception
    }
  }

  /**
   * Get transaction fee from GoodDollarReserveContract
   * @returns {Promise<boolean>}
   */
  async calculateTxFee(amount): Promise<boolean> {
    try {
      const { 0: fee, 1: senderPays } = await this.tokenContract.methods.getFees(amount).call()
      return senderPays ? toBN(fee) : ZERO
    } catch (exception) {
      const { message } = exception

      log.warn('getTxFee failed', message, exception)
      throw exception
    }
  }

  /**
   * Checks if use can send an specific amount of G$s
   * @param {number} amount
   * @param {object} options
   * @returns {Promise<boolean>}
   */
  async canSend(amount: number, options = {}): Promise<boolean> {
    try {
      const { feeIncluded = false } = options
      let amountWithFee = amount

      if (!feeIncluded) {
        // 1% is represented as 10000, and divided by 1000000 when required to be % representation to enable more granularity in the numbers (as Solidity doesn't support floating point)
        const fee = await this.calculateTxFee(amount)

        amountWithFee = new BN(amount).add(fee)
      }
      const balance = await this.balanceOf()
      return parseInt(amountWithFee) <= balance
    } catch (exception) {
      const { message } = exception
      log.warn('canSend failed', message, exception)
    }
    return false
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
  generatePaymentLink(
    amount: number,
    reason: string = '',
    inviteCode: string,
    events: PromiEvents = defaultPromiEvents,
  ): { code: string, hashedCode: string, paymentLink: string } {
    const { privateKey: code, address: hashedCode } = this.wallet.eth.accounts.create()

    log.debug('generatePaymentLink:', { amount, code, hashedCode })

    const params = {
      p: code,
      r: reason,
    }
    inviteCode && (params.i = inviteCode)

    const paymentLink = generateShareLink('send', params)

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
  getWithdrawLink(otlCode: string) {
    return this.wallet.eth.accounts.privateKeyToAccount(otlCode).address
  }

  /**
   * checks against oneTimeLink contract, if the specified hash code has already been used to send payment or not.
   * @param {string} link
   * @returns {Promise<boolean>}
   */
  isPaymentLinkAvailable(link: string): Promise<boolean> {
    try {
      return this.oneTimePaymentsContract.methods.hasPayment(link).call()
    } catch (exception) {
      const { message } = exception

      log.warn('isPaymentLinkAvailable failed', message, exception)
      throw exception
    }
  }

  /**
   * Depending on what's queried off the blockchain for the OTL code, will return an status to display
   * @param otlCode - one time link code
   * @returns {Promise<{status:'Completed' | 'Cancelled' | 'Pending'}>}
   */
  async getWithdrawDetails(otlCode: string): Promise<{ status: 'Completed' | 'Cancelled' | 'Pending' }> {
    try {
      const hashedCode = this.getWithdrawLink(otlCode)
      const { paymentAmount, hasPayment, paymentSender: sender } = await this.oneTimePaymentsContract.methods
        .payments(hashedCode)
        .call()

      const amount = toBN(paymentAmount).toNumber()
      let status = WITHDRAW_STATUS_UNKNOWN

      // Check payment availability
      if (hasPayment && amount > 0) {
        status = WITHDRAW_STATUS_PENDING
      }

      if (hasPayment === false && toBN(sender).isZero() === false) {
        status = WITHDRAW_STATUS_COMPLETE
      }

      return {
        hashedCode,
        status,
        amount,
        sender,
      }
    } catch (exception) {
      const { message } = exception

      log.warn('getWithdrawDetails failed', message, exception)
      throw exception
    }
  }

  /**
   * withdraws the payment received in the link to the current wallet holder
   * @param {string} otlCode - the privatekey to unlock payment
   * @param {PromiEvents} callbacks
   */
  withdraw(otlCode: string, callbacks: PromiEvents) {
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
  async cancelOTLByTransactionHash(transactionHash: string, txCallbacks: {} = {}): Promise<TransactionReceipt> {
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

  async collectInviteBounties() {
    const tx = this.invitesContract.methods.collectBounties()
    const res = await this.sendTransaction(tx)
    return res
  }

  async collectInviteBounty(invitee) {
    const bountyFor = invitee || this.account
    const canCollect = await this.invitesContract.methods.canCollectBountyFor(bountyFor)
    if (canCollect) {
      const tx = this.invitesContract.methods.bountyFor(bountyFor)
      const res = await this.sendTransaction(tx, {})
      return res
    }
  }

  async joinInvites(inviter, codeLength = 10) {
    let myCode = bs58.encode(Buffer.from(this.account.slice(2), 'hex')).slice(0, codeLength)
    const registered = await this.invitesContract.methods.codeToUser(this.wallet.utils.fromAscii(myCode)).call()

    log.debug('joinInvites:', { inviter, myCode, codeLength, registered })

    //not registered
    if (registered.search(/^0x0+$/) >= 0) {
      const tx = this.invitesContract.methods.join(
        this.wallet.utils.fromAscii(myCode),
        (inviter && this.wallet.utils.fromAscii(inviter)) || '0x0'.padEnd(66, 0),
      )
      log.debug('joinInvites registering:', { inviter, myCode, codeLength, registered })
      await this.sendTransaction(tx).catch(e => {
        log.error('joinInvites failed:', e.message, e, { inviter, myCode, codeLength, registered })
        throw e
      })
      return myCode
    }

    //already registered
    if (registered === this.account) {
      return myCode
    }

    //code collission
    log.warn('joinInvites code collision:', { inviter, myCode, codeLength, registered })
    return this.joinInvites(inviter, codeLength + 1)
  }

  async getUserInviteBounty() {
    const user =
      (await this.invitesContract.methods
        .users(this.account)
        .call()
        .catch(_ => {})) || {}
    const level =
      (await this.invitesContract.methods
        .levels(user.level)
        .call()
        .catch(_ => {})) || {}
    return result(level, 'bounty.toNumber', 10000) / 100
  }

  handleError(e: Error) {
    log.error('handleError', e.message, e, { category: ExceptionCategory.Blockhain })

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
      log.error('failed to retrieve gas price from network', e.message, e, { category: ExceptionCategory.Blockhain })
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
        log.info('no gas, asking for top wallet', { nativeBalance, required: wei, address: this.account })
        const toppingRes = await API.verifyTopWallet()
        const { data } = toppingRes
        if (!data || data.ok !== 1) {
          return {
            ok: false,
            error:
              !data || (data.error && !~data.error.indexOf(`User doesn't need topping`)) || data.sendEtherOutOfSystem,
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
      log.warn('verifyHasGas:', e.message, e, { wei })
      return {
        ok: false,
        error: false,
        message: e.message,
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
    { gas: setgas, gasPrice }: GasValues = { gas: undefined, gasPrice: undefined },
  ) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = { ...defaultPromiEvents, ...txCallbacks }
    let gas = setgas || (await tx.estimateGas().catch(e => log.debug('estimate gas failed'))) || 200000
    gasPrice = gasPrice || this.gasPrice
    if (Config.network === 'develop' && setgas === undefined) {
      gas *= 2
    }
    log.debug('sendTransaction:', { gas, gasPrice })
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
          log.error('sendTransaction error:', e.message, e, {
            tx,
            category: ExceptionCategory.Blockhain,
          })
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
