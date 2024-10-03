// @flow

import GoodDollarABI from '@gooddollar/goodprotocol/artifacts/abis/IGoodDollar.min.json'
import IdentityABI from '@gooddollar/goodprotocol/artifacts/abis/IdentityV2.min.json'
import cERC20ABI from '@gooddollar/goodprotocol/artifacts/abis/cERC20.min.json'
import SimpleStakingABI from '@gooddollar/goodprotocol/artifacts/abis/SimpleStakingV2.min.json'
import UBIABI from '@gooddollar/goodprotocol/artifacts/abis/UBIScheme.min.json'
import GOODToken from '@gooddollar/goodprotocol/artifacts/abis/GReputation.min.json'
import ContractsAddress from '@gooddollar/goodprotocol/releases/deployment.json'
import BridgeAddress from '@gooddollar/bridge-contracts/release/deployment.json'
import OneTimePaymentsABI from '@gooddollar/goodcontracts/build/contracts/OneTimePayments.min.json'
import StakingModelAddress from '@gooddollar/goodcontracts/stakingModel/releases/deployment.json'
import InvitesABI from '@gooddollar/goodprotocol/artifacts/abis/InvitesV2.min.json'
import FaucetABI from '@gooddollar/goodprotocol/artifacts/abis/Faucet.min.json'

import BuyGDCloneABI from '@gooddollar/goodprotocol/artifacts/abis/BuyGDClone.min.json'

import { MultiCall } from 'eth-multicall'
import Web3 from 'web3'
import { BN, hexToNumber, toBN } from 'web3-utils'

import abiDecoder from 'abi-decoder'
import {
  assign,
  chunk,
  filter,
  findKey,
  first,
  flatten,
  get,
  identity,
  last,
  mapValues,
  noop,
  over,
  pickBy,
  range,
  sortBy,
  throttle,
  uniq,
  uniqBy,
  values,
} from 'lodash'
import moment from 'moment'
import bs58 from 'bs58'
import { PrivateKey } from '@textile/crypto'
import { signTypedData } from '@metamask/eth-sig-util'
import Mutex from 'await-mutex'
import { pRateLimit } from 'p-ratelimit'
import Config from '../../config/config'
import { ExceptionCategory } from '../exceptions/utils'
import { tryJson } from '../utils/string'
import API from '../API'
import { delay, retry } from '../utils/async'
import AsyncStorage from '../utils/asyncStorage'
import { generateShareLink } from '../share'
import logger from '../logger/js-logger'
import WalletFactory from './WalletFactory'
import {
  fromDecimals,
  getTxLogArgs,
  NULL_ADDRESS,
  safeCall,
  toDecimals,
  WITHDRAW_STATUS_COMPLETE,
  WITHDRAW_STATUS_PENDING,
  WITHDRAW_STATUS_UNKNOWN,
} from './utils'

import { MultipleHttpProvider } from './MultipleHttpProvider'

const log = logger.child({ from: 'GoodWalletV2' })

// eslint-disable-next-line require-await
export const retryCall = async (asyncFn, retries = 3, delay = 1000) => retry(asyncFn, retries, delay)

const ZERO = new BN('0')
const POKT_MAX_EVENTSBLOCKS = 40000
const FIXED_SEND_GAS = 21000

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
const MultiCalls = {
  3: '0xFa8d865A962ca8456dF331D78806152d3aC5B84F',
  1: '0x5Eb3fa2DFECdDe21C950813C665E9364fa609bD2',
  122: '0x2219bf813a0f8f28d801859c215a5a94cca90ed1',
  42220: '0xEa12bB3917cf6aE2FDE97cE4756177703426d41F',
}

const gasMutex = new Mutex()

export class GoodWallet {
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

  oneTimePaymentsV2Contract: Web3.eth.Contract

  erc20Contract: Web3.eth.Contract

  UBIContract: Web3.eth.Contract

  SimpleDaiStaking: Web3.eth.Contract

  invitesContract: Web3.eth.Contract

  faucetContract: Web3.eth.Contract

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

  init(walletConfig): Promise<any> {
    if (walletConfig) {
      this.config = walletConfig
    }

    this.mainnetNetwork = (() => {
      return 'production-mainnet'
    })()

    const mainnetNetworkId = get(ContractsAddress, this.mainnetNetwork + '.networkId', 122)
    const { httpWeb3provider: endpoints } = Config.ethereum[mainnetNetworkId]

    const mainnetEndpoints = uniq(endpoints.split(',')).map(provider => ({ provider, options: {} }))
    const mainnetProviderOpts = {
      strategy: Config.httpProviderStrategy,
      retries: Config.httpProviderRetries,
    }

    this.web3Mainnet = new Web3(new MultipleHttpProvider(mainnetEndpoints, mainnetProviderOpts))

    const network = this.config.network
    const networkId = get(ContractsAddress, network + '.networkId', 122)
    const ready = WalletFactory.create({ ...this.config, network_id: networkId })

    this.ready = ready
      .then(wallet => {
        const { estimateGasPrice } = Config

        assign(this, { network, networkId })

        log.info('GoodWallet initial wallet created.', {
          mainnetNetwork: this.mainnetNetwork,
          network,
          networkId,
          mainnetNetworkId,
          mainnetEndpoints,
        })

        const defaultGasPrice = Config.ethereum[networkId].gasPrice ?? 1

        this.wallet = wallet
        this.accounts = this.wallet.eth.accounts.wallet
        this.account = this.getAccountForType('gd')
        this.wallet.eth.defaultAccount = this.account
        this.gasPrice = Number(wallet.utils.toWei(String(defaultGasPrice), 'gwei'))

        log.info(`networkId: ${this.networkId}`)

        if (estimateGasPrice) {
          this.fetchGasPrice()
            .then(price => (this.gasPrice = price))
            .catch(noop)
        }

        this.multicallFuse = new MultiCall(this.wallet, MultiCalls[this.networkId])
        this.multicallMainnet = new MultiCall(this.web3Mainnet, MultiCalls[mainnetNetworkId])

        log.info('GoodWallet setting up contracts:')

        // added those helpers just do not check address / contract existence 9 times
        const makeContract = (abi, name, defaultAddress = null) => {
          const address = get(ContractsAddress, `${this.network}.${name}`, defaultAddress)

          // do not create contract if no address in contracts for the network selected
          if (address) {
            return new this.wallet.eth.Contract(abi.abi, address, { from: this.account })
          }
        }

        const addContract = (abi, name, defaultAddress = null) => {
          const contract = makeContract(abi, name, defaultAddress)

          if (contract) {
            abiDecoder.addABI(abi.abi)
            return contract
          }
        }

        // Identity Contract
        this.identityContract = makeContract(IdentityABI, 'Identity')

        // Token Contract
        this.tokenContract = addContract(GoodDollarABI, 'GoodDollar')

        // ERC20 Contract
        this.erc20Contract = addContract(cERC20ABI, 'GoodDollar')

        // UBI Contract
        this.UBIContract = addContract(UBIABI, 'UBIScheme')

        // OneTimePaymentLinks Contract
        this.oneTimePaymentsContract = addContract(OneTimePaymentsABI, 'OneTimePayments')

        // UBI Contract
        this.invitesContract = addContract(InvitesABI, 'Invites', '0x5a35C3BC159C4e4afAfadbdcDd8dCd2dd8EC8CBE')

        // faucet Contract
        this.faucetContract = addContract(FaucetABI, 'FuseFaucet', get(ContractsAddress, `${this.network}.Faucet`))

        // GOOD Contract
        this.GOODContract = addContract(GOODToken, 'GReputation')

        // BuyGDClone Contract
        this.BuyGDClone = addContract(BuyGDCloneABI, 'BuyGDFactoryV2')

        this.GoodReserve = new this.web3Mainnet.eth.Contract(
          [
            {
              inputs: [],
              name: 'currentPriceDAI',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
            },
            {
              anonymous: false,
              inputs: [
                { indexed: true, internalType: 'uint256', name: 'day', type: 'uint256' },
                { indexed: true, internalType: 'address', name: 'interestToken', type: 'address' },
                { indexed: false, internalType: 'uint256', name: 'interestReceived', type: 'uint256' },
                { indexed: false, internalType: 'uint256', name: 'gdInterestMinted', type: 'uint256' },
                { indexed: false, internalType: 'uint256', name: 'gdExpansionMinted', type: 'uint256' },
                { indexed: false, internalType: 'uint256', name: 'gdUbiTransferred', type: 'uint256' },
              ],
              name: 'UBIMinted',
              type: 'event',
            },
          ],
          ContractsAddress[this.mainnetNetwork].GoodReserveCDai,
          { from: this.account },
        )

        // debug print contracts addresses
        {
          const { network, networkId } = this
          const contractAddresses = ContractsAddress[network]
          const mainnetAddresses = ContractsAddress[this.mainnetNetwork]

          log.debug('GoodWallet initialized with addresses', {
            networkId,
            mainnetNetworkId,
            network,
            contractAddresses,
            mainnetAddresses,
          })
        }

        log.info('GoodWallet Ready.', { account: this.account })
      })
      .catch(e => {
        log.warn('Failed initializing GoodWallet', e.message, e, { category: ExceptionCategory.Blockhain })
        throw e
      })
    return this.ready
  }

  getRewardsAddresses() {
    const addr = get(ContractsAddress, `${this.network}.Invites`)
    return [addr].filter(_ => _ && _ !== NULL_ADDRESS).map(_ => _.toLowerCase())
  }

  getUBIAddresses() {
    const addrs = [
      get(StakingModelAddress, `${this.network}.UBIScheme`),
      get(StakingModelAddress, `${this.network}.UBISchemeOld`),
      get(ContractsAddress, `${this.network}.UBIScheme`),
      get(ContractsAddress, `production-bug.UBIScheme`),
    ]
    return addrs.filter(_ => _ && _ !== NULL_ADDRESS).map(_ => _.toLowerCase())
  }

  getBridgeAddresses() {
    const micorBridge = flatten(Object.values(BridgeAddress).map(_ => Object.values(_)))
    const multichainRouter = get(ContractsAddress, `${this.network}.MultichainRouter`)
    const kimaRouter = '' //TODO: update
    return [...micorBridge, multichainRouter, kimaRouter].filter(_ => _).map(_ => _.toLowerCase())
  }

  async setIsPollEvents(active) {
    this.isPollEvents = active
    if (!active) {
      this.pollEventsCurrentPromise && (await this.pollEventsCurrentPromise)
      this.pollEventsCurrentPromise = null
    }
  }

  async pollEvents(time, lastBlockCallback) {
    try {
      const run = async () => {
        if (this.isPollEvents === false) {
          return
        }

        const startBlock = this.lastEventsBlock
        const currentBlock = await this.getBlockNumber()

        const lastBlock = await this.syncTxFromExplorer(startBlock, currentBlock)
          .catch(e => {
            // we only log error if also the fallback syncTxWithBlockchain fail
            log.warn('syncTxFromExplorer failed', e.message, e, {
              networkId: this.networkId,
              startBlock,
            })

            return this.syncTxWithBlockchain(startBlock)
          })
          .catch(e => {
            log.error('syncTx failed both explorer and rpc', e.message, e, {
              startBlock,
              lastBlock,
              networkId: this.networkId,
            })
          })

        if (!lastBlock) {
          log.info('pollEvents failed:', { startBlock, lastBlock })
          return
        }
        this.lastEventsBlock = lastBlock
        lastBlockCallback(lastBlock)

        log.info('pollEvents success:', { startBlock, lastBlock })
        return true
      }

      const runRes = Promise.race([run(), delay(5000, false)])

      this.pollEventsCurrentPromise = runRes

      if ((await runRes) === false) {
        throw new Error('pollEvents not completed after 5 seconds')
      }
    } catch (e) {
      log.warn('pollEvents failed:', e.message, e, { category: ExceptionCategory.Blockhain })
    }

    this.pollEventsTimeout = setTimeout(() => this.pollEvents(time, lastBlockCallback), time)
  }

  // eslint-disable-next-line require-await
  async watchEvents(startFrom, lastBlockCallback) {
    this.pollEventsTimeout && clearTimeout(this.pollEventsTimeout)
    this.pollEventsTimeout = null

    const { account } = this
    let fromBlock = startFrom

    await this.setIsPollEvents(true)

    if (!startFrom) {
      const fetchTokenTxs = () => API.getNativeTxs(account, this.networkId, null, false)
      const [firstTx] = await retry(fetchTokenTxs, 3, 500).catch(() => [])

      fromBlock = get(firstTx, 'blockNumber')

      if (!fromBlock) {
        fromBlock = await this.getBlockNumber()
      }

      log.info('watchEvents: got txs from explorer', { firstTx, fromBlock })
    }

    lastBlockCallback(fromBlock)
    this.lastEventsBlock = fromBlock

    this.pollEvents(Config.web3Polling, lastBlockCallback)
  }

  _notifyEvents(events, fromBlock) {
    if (events.length === 0) {
      return
    }

    log.debug('_notifyEvents got events', { events, fromBlock })
    this.notifyBalanceChanged()

    const uniqEvents = sortBy(uniqBy(events, 'transactionHash'), 'blockNumber')

    return Promise.all(
      uniqEvents.map(event =>
        this._notifyReceipt(event.transactionHash).catch(err =>
          log.error('_notifyEvents event get/send receipt failed:', err.message, err, {
            category: ExceptionCategory.Blockhain,
            event: event,
          }),
        ),
      ),
    )
  }

  async processEvents(eventsPromise, startBlock) {
    const events = await eventsPromise
    const chunks = chunk(events, 10)
    const limit = pRateLimit({ concurrency: 2, interval: 1000, rate: 1 })
    await Promise.all(chunks.map(c => limit(() => this._notifyEvents(c, startBlock))))
  }

  async syncTxFromExplorer(startBlock, currentBlock) {
    const { account, networkId, tokenContract, oneTimePaymentsContract } = this
    const { _address: tokenAddress } = tokenContract || {}
    const { _address: otpAddress } = oneTimePaymentsContract || {}

    let withdrawEvents = []
    let cancelEvents = []
    let txEvents = []

    const withdrawHash = '0x39ca68a9f5d8038e871ef25a6622a56579cda4a6eedf63813574d23652e94048'
    const cancelHash = '0xb1f6a8f6b8fb527cfeec0df589160bc2a92ff715097117cb250e823c7106bc2f'

    const getOTPL = hash => API.getOTPLEvents(account, networkId, otpAddress, startBlock, currentBlock, hash)

    txEvents = await API.getTokenTxs(tokenAddress, account, networkId, startBlock).then(results =>
      results.map(result => ({ ...result, transactionHash: result.transactionHash || result.hash })),
    )

    if (otpAddress) {
      withdrawEvents = await getOTPL(withdrawHash)
      cancelEvents = await getOTPL(cancelHash)
    }

    await this.processEvents([...txEvents, ...withdrawEvents, ...cancelEvents])

    const lastBlockNumbers = [
      last(txEvents)?.blockNumber,
      hexToNumber(last(withdrawEvents)?.blockNumber),
      hexToNumber(last(cancelEvents)?.blockNumber),
    ].filter(blockNumber => !!blockNumber)

    const lastBlock = lastBlockNumbers.length > 0 ? Math.max(...lastBlockNumbers) : undefined

    return lastBlock ? lastBlock + 1 : startBlock
  }

  notifyBalanceChanged() {
    over(this.getSubscribers('balanceChanged'))()
  }

  async syncTxWithBlockchain(fromBlock) {
    const lastBlock = await this.wallet.eth.getBlockNumber()
    const startBlock = Math.min(fromBlock, lastBlock)
    const steps = range(startBlock, lastBlock, POKT_MAX_EVENTSBLOCKS)

    log.debug('Start sync tx from blockchain', {
      steps,
      startBlock,
      lastBlock,
    })

    const limit = pRateLimit({ concurrency: 5, interval: 1000, rate: 3 })

    const ps = steps.map(fromBlock => {
      let toBlock = fromBlock + POKT_MAX_EVENTSBLOCKS

      // await callback to finish processing events before updating lastEventblock
      // we pass toBlock as null so the request naturally requests until the last block a node has,
      // this is to prevent errors where some nodes for some reason still dont have the last block
      toBlock = Math.min(toBlock, lastBlock)

      return limit(async () => {
        log.debug('executing sync tx step:', { fromBlock, toBlock })

        const events = await Promise.all([
          this.pollSendEvents(toBlock, fromBlock),
          this.pollReceiveEvents(toBlock, fromBlock),
          this.pollOTPLEvents(toBlock, fromBlock),
        ]).then(flatten)

        this._notifyEvents(events, fromBlock)
        log.debug('DONE executing sync tx step:', { fromBlock, toBlock })
        return events
      })
    })

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(ps)
    log.debug('sync tx from blockchain finished successfully')

    return lastBlock
  }

  async pollSendEvents(toBlock, from = null) {
    const fromBlock = from || this.lastEventsBlock
    const contract = this.erc20Contract

    const fromEventsFilter = pickBy(
      {
        fromBlock,
        toBlock,
        filter: { from: this.wallet.utils.toChecksumAddress(this.account) },
      },
      identity,
    )

    const ps = contract ? retryCall(() => contract.getPastEvents('Transfer', fromEventsFilter)) : Promise.resolve([])

    const events = await ps.catch((e = {}) => {
      // just warn about block not  found which is recoverable
      const logFunc = e.code === -32000 ? 'warn' : 'error'

      log[logFunc]('pollSendEvents failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        fromEventsFilter,
      })

      return []
    })

    log.info('pollSendEvents result:', { events, from, fromBlock, toBlock, lastEventsBlock: this.lastEventsBlock })
    return events
  }

  async pollReceiveEvents(toBlock, from = null) {
    const fromBlock = from || this.lastEventsBlock
    const contract = this.erc20Contract

    const toEventsFilter = pickBy(
      {
        fromBlock,
        toBlock,
        filter: { to: this.wallet.utils.toChecksumAddress(this.account) },
      },
      identity,
    )

    const ps = contract ? retryCall(() => contract.getPastEvents('Transfer', toEventsFilter)) : Promise.resolve([])

    const events = await ps.catch((e = {}) => {
      // just warn about block not  found which is recoverable
      const logFunc = e.code === -32000 ? 'warn' : 'error'

      log[logFunc]('pollReceiveEvents failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        toEventsFilter,
      })

      return []
    })

    log.info('pollReceiveEvents result:', { events, from, fromBlock, toBlock, lastEventsBlock: this.lastEventsBlock })
    return events
  }

  async pollOTPLEvents(toBlock, from = null) {
    const fromBlock = from || this.lastEventsBlock
    const contract = this.oneTimePaymentsContract

    let fromEventsFilter = pickBy(
      {
        fromBlock,
        toBlock,
        filter: { from: this.wallet.utils.toChecksumAddress(this.account) },
      },
      identity,
    )

    log.debug('pollOTPLEvents call', { fromEventsFilter })

    let ps = contract
      ? retryCall(() => contract.getPastEvents('PaymentCancel', Object.assign({}, fromEventsFilter)))
      : Promise.resolve([])

    const eventsCancel = await ps.catch((e = {}) => {
      // just warn about block not  found which is recoverable
      const logFunc = e.code === -32000 ? 'warn' : 'error'

      log[logFunc]('pollOTPLEvents failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        fromEventsFilter,
      })

      return []
    })

    if (contract) {
      ps = retryCall(() => contract.getPastEvents('PaymentWithdraw', fromEventsFilter))
    }

    // const eventsWithdraw = []
    const eventsWithdraw = await ps.catch((e = {}) => {
      // just warn about block not  found which is recoverable
      const logFunc = e.code === -32000 ? 'warn' : 'error'

      log[logFunc]('pollOTPLEvents failed:', e.message, e, {
        category: ExceptionCategory.Blockhain,
        fromEventsFilter,
      })

      return []
    })

    const events = eventsWithdraw.concat(eventsCancel)

    log.info('pollOTPLEvents result:', { events, from, fromBlock, toBlock, lastEventsBlock: this.lastEventsBlock })
    return events
  }

  /**
   * @return an existing (non-pending) transaction receipt information + human readable logs of the transaction
   * @param transactionHash The TX hash to return the data for
   */
  async getReceiptWithLogs(transactionHash: string) {
    const chainId = this.networkId
    const transactionReceipt = await retryCall(() => this.wallet.eth.getTransactionReceipt(transactionHash), 3, 3000)

    if (!transactionReceipt) {
      return null
    }

    const logs = filter(abiDecoder.decodeLogs(transactionReceipt.logs))

    return { ...transactionReceipt, logs, chainId } //add network id in case of wallet provider network switch
  }

  sendReceiptWithLogsToSubscribers(receipt: any, subscriptions: Array<string>) {
    subscriptions.forEach(subscription => {
      const subscribers = this.getSubscribers(subscription)
      log.debug('sendReceiptWithLogsToSubscribers', { receipt, subscription, subscribers })
      subscribers.forEach(cb => {
        log.debug('sendReceiptWithLogsToSubscribers receiptCallback:', {
          subscription,
          hash: receipt.transactionHash,
          cb,
        })
        cb(receipt)
      })
    })
    return receipt
  }

  async _notifyReceipt(txHash) {
    const receipt = await this.getReceiptWithLogs(txHash)

    if (!receipt) {
      return
    }

    return this.sendReceiptWithLogsToSubscribers(receipt, ['receiptUpdated'])
  }

  /**
   * Deletes the current account
   * @returns {Promise<Promise|Q.Promise<TransactionReceipt>|Promise<*>|*>}
   */
  async deleteAccount(): Promise<TransactionReceipt | void> {
    const canDelete = await this.identityContract.methods
      .lastAuthenticated(this.account)
      .call()
      .then(_ => parseInt(_) > 0)
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
    return this.sendTransaction(this.UBIContract.methods.claim(), callbacks)
  }

  async checkEntitlement(): Promise<number> {
    try {
      return await retryCall(() => this.UBIContract.methods.checkEntitlement().call().then(parseInt))
    } catch (exception) {
      log.error('checkEntitlement failed', exception.message, exception)
      return 0
    }
  }

  /**
   * use multicall to get many stats
   */
  async getClaimScreenStatsFuse() {
    const calls = [
      {
        periodStart: this.UBIContract.methods.periodStart(),
        currentDay: this.UBIContract.methods.currentDay(),
        activeClaimers: this.UBIContract.methods.activeUsersCount(),
        distribution: this.UBIContract.methods.dailyCyclePool(),
        dailyStats: this.UBIContract.methods.getDailyStats(),
      },
    ]

    // entitelment is separate because it depends on msg.sender
    const [[[res]], entitlement] = await Promise.all([this.multicallFuse.all([calls]), this.checkEntitlement()])

    // fetch prev day claimers
    const prevDayClaimers = await this.UBIContract.methods.getClaimerCount(Number(res.currentDay) - 1).call()

    res.entitlement = this.toDecimals(entitlement)
    res.claimers = res.dailyStats[0]
    res.claimAmount = this.toDecimals(res.dailyStats[1])
    res.distribution = this.toDecimals(res.distribution)
    res.activeClaimers = Math.max(res.activeClaimers || 0, res.claimers, prevDayClaimers)
    delete res.dailyStats

    // const result = mapValues(res, parseInt)
    const result = res

    const startRef = moment(Number(result.periodStart) * 1000).utc()
    if (startRef.isBefore(moment().utc())) {
      startRef.add(Number(result.currentDay) + 1, 'days')
    }
    result.nextClaim = Number(result.entitlement) > 0 ? 0 : startRef.valueOf()

    return result
  }

  // throttle querying blockchain/thegraph to once an hour
  getReservePriceDAI = throttle(
    async () => {
      try {
        const priceResult = await retryCall(async () => {
          const price = await this.GoodReserve.methods.currentPriceDAI().call()
          return Number(price / 1e18)
        })
        return priceResult
      } catch (e) {
        log.warn('getReservePriceDAI failed:', e.message, e)
        throw e
      }
    },
    1000 * 60 * 60,
    { leading: true },
  )

  getLastUBIEvent = async () => {
    let fromBlock = await AsyncStorage.getItem('lastUBIEventBlock')
    let events = []
    if (fromBlock == null) {
      const step = 50000
      fromBlock = await this.web3Mainnet.eth.getBlockNumber()
      try {
        while (events.length === 0) {
          fromBlock -= step
          // eslint-disable-next-line no-await-in-loop, no-loop-func
          events = await retryCall(() => {
            return this.GoodReserve.getPastEvents('UBIMinted', {
              fromBlock,
              toBlock: fromBlock + step,
            })
          })
        }
      } catch (e) {
        log.debug('getLastUBIEvent failed:', e.message, e)
        throw e
      }
    } else {
      events = await retryCall(() => {
        return this.GoodReserve.getPastEvents('UBIMinted', {
          fromBlock,
          toBlock: 'latest',
        })
      })
    }
    const lastEvent = last(events)
    AsyncStorage.setItem('lastUBIEventBlock', lastEvent.blockNumber)
    return lastEvent
  }

  // throttle querying blockchain/thegraph to once an hour
  getClaimScreenStatsMainnet = throttle(
    async () => {
      const stakingContracts = get(ContractsAddress, `${this.mainnetNetwork}.StakingContractsV3`, [])
      let gainCalls = stakingContracts.map(([addr, rewards]) => {
        const stakingContract = new this.web3Mainnet.eth.Contract(SimpleStakingABI.abi, addr, { from: this.account })

        return { currentGains: stakingContract.methods.currentGains(true, true) }
      })

      let [[stakeResult], ubiEvent] = await Promise.all([
        retryCall(() => this.multicallMainnet.all([gainCalls])).catch(e => {
          log.warn('multicallMainnet failed:', e.message, e)
          return null
        }),
        retryCall(() => this.getLastUBIEvent(), 1).catch(e => {
          log.warn('getLastUBIEvent failed:', e.message, e)
          return null
        }),
      ])

      const interestCollected = ubiEvent?.returnValues.interestReceived / 1e18
      log.debug('getInterestCollected:', { stakeResult, ubiEvent, interestCollected })

      const result = { interestCollected }
      if (stakeResult) {
        stakeResult = stakeResult.map(({ currentGains }) => [
          parseInt(currentGains[3]) / 1e8,
          parseInt(currentGains[4]) / 1e8,
        ])

        result.totalFundsStaked = stakeResult.reduce((prev, cur) => prev + cur[0], 0)
        result.pendingInterest = stakeResult.reduce((prev, cur) => prev + cur[1], 0)
      }

      return result
    },
    1000 * 60 * 60,
    { leading: true },
  )

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
    const id = Math.max(...Object.keys(subscribers).map(Number), 0) + 1 // Give next id in a raw to current subscriber
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
      const balance = await retryCall(() => this.tokenContract.methods.balanceOf(this.account).call())
      const balanceValue = toBN(balance)

      return balanceValue
    } catch (exception) {
      log.error('BalanceOf failed', exception.message, exception)
      return toBN(0)
    }
  }

  async balanceOfNative(): Promise<number> {
    const { wallet, account } = this

    try {
      const balance = await retryCall(() => wallet.eth.getBalance(account))
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

  getAccountForType(type: AccountUsage): string {
    const { defaultAccount } = get(this.wallet, 'eth', {})
    const accountPath = GoodWallet.AccountUsageToPath[type]
    const account = get(this.accounts, [accountPath, 'address'], defaultAccount)

    return account ? account.toString() : ''
  }

  async sign(toSign: string, accountType: AccountUsage = 'gd'): Promise<string> {
    let account = this.getAccountForType(accountType)
    let signed = await this.wallet.eth.sign(toSign, account)

    return signed
  }

  async personalSign(toSign: string, accountType: AccountUsage = 'gd'): Promise<string> {
    const accountPath = GoodWallet.AccountUsageToPath[accountType]
    let signed = await this.wallet.eth.accounts.sign(toSign, this.accounts[accountPath].privateKey)

    return signed.signature
  }

  // eslint-disable-next-line require-await
  async signTypedData(message: string) {
    const pkeyBuffer = Buffer.from(this.accounts[0].privateKey.slice(2), 'hex')
    const parsedData = tryJson(message)

    // There are 3 types of messages
    // v1 => basic data types
    // v3 =>  has type / domain / primaryType
    // v4 => same as v3 but also supports which supports arrays and recursive structs.
    // Because v4 is backwards compatible with v3, we're supporting only v4
    const { types, primaryType, domain } = parsedData || {}
    const version = types || primaryType || domain ? 'v4' : 'v1'

    return signTypedData({
      data: parsedData,
      privateKey: pkeyBuffer,
      version: version.toUpperCase(),
    })
  }

  // eslint-disable-next-line require-await
  getEd25519Key(accountType: AccountUsage): PrivateKey {
    const pkeySeed = this.accounts[this.getAccountForType(accountType)].privateKey.slice(2)
    const seed = Uint8Array.from(Buffer.from(pkeySeed, 'hex'))
    return PrivateKey.fromRawEd25519Seed(seed)
  }

  /**
   * Determines if a specified address is verified in the blockchain
   * @param address
   * @returns {Promise<boolean>}
   */
  isVerified(address: string): Promise<boolean> {
    try {
      return retryCall(() => this.identityContract.methods.isWhitelisted(address).call())
    } catch (exception) {
      log.error('isVerified failed', exception.message, exception)
      return false
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
      const { 0: fee, 1: senderPays } = await retryCall(() => this.tokenContract.methods.getFees(1).call())

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
      const { 0: fee, 1: senderPays } = await retryCall(() => this.tokenContract.methods.getFees(amount).call())

      return senderPays ? toBN(fee) : ZERO
    } catch (exception) {
      const { message } = exception

      log.warn('getTxFee failed', message, exception)
      throw exception
    }
  }

  async getNativeTxFee(): Promise<number> {
    try {
      const gasPrice = await retryCall(() => this.fetchGasPrice())

      // Gas Cost : 21000 for fixed Send
      return toBN(FIXED_SEND_GAS * gasPrice)
    } catch (exception) {
      const { message } = exception

      log.warn('getNativeTxFee failed', message, exception)
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
      let amountWithFee = new BN(amount)

      if (!feeIncluded) {
        // 1% is represented as 10000, and divided by 1000000 when required to be % representation to enable more granularity in the numbers (as Solidity doesn't support floating point)
        const fee = await this.calculateTxFee(amount)

        amountWithFee = amountWithFee.add(fee)
      }

      const balance = await this.balanceOf()

      return amountWithFee.lte(new BN(String(balance)))
    } catch (exception) {
      log.error('canSend failed', exception.message, exception)
    }
    return false
  }

  async canSendNative(amount: number, options = {}): Promise<boolean> {
    try {
      const { feeIncluded = false } = options
      let amountWithFee = new BN(amount)

      if (!feeIncluded) {
        const fee = await this.getNativeTxFee()

        amountWithFee = amountWithFee.add(fee)
      }

      const balance = await this.balanceOfNative()

      return amountWithFee.lte(new BN(String(balance)))
    } catch (exception) {
      log.error('canSendNative failed', exception.message, exception)
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

    const otpAddress = this.oneTimePaymentsContract._address
    const transferAndCall = this.tokenContract.methods.transferAndCall(otpAddress, amount, hashedCode)

    // don't wait for transaction return immediately with hash code and link (not using await here)
    return this.sendTransaction(transferAndCall, callbacks)
  }

  /**
   * deposits the specified amount to _oneTimeLink_ contract and generates a link that will send the user to a URL to withdraw it
   * @param {number} amount - amount of money to send using OTP
   * @param {string} reason - optional reason for sending the payment (comment)
   * @param {string} category - optional category for sending the payment (comment)
   * @param {({ link: string, code: string }) => () => any} getOnTxHash - a callback that returns onTransactionHashHandler based on generated code
   * @param {PromiEvents} events - used to subscribe to onTransactionHash event
   * @returns {{code, hashedCode, paymentLink}}
   */
  generatePaymentLink(
    amount: number,
    reason: string = '',
    category: string = '',
    inviteCode: string,
    events: PromiEvents = defaultPromiEvents,
  ): { code: string, hashedCode: string, paymentLink: string } {
    const { privateKey: code, address: hashedCode } = this.wallet.eth.accounts.create()

    log.debug('generatePaymentLink:', { amount, code, hashedCode, reason, category })

    const params = {
      p: code,
      r: reason,
      cat: category,
      n: this.networkId,
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
      return retryCall(() => this.oneTimePaymentsContract.methods.hasPayment(link).call())
    } catch (exception) {
      log.error('isPaymentLinkAvailable failed', exception.message, exception)
      return false
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
      const {
        paymentAmount,
        hasPayment,
        paymentSender: sender,
      } = await retryCall(() => this.oneTimePaymentsContract.methods.payments(hashedCode).call())
      const amount = toBN(paymentAmount)
      let status = WITHDRAW_STATUS_UNKNOWN

      // Check payment availability
      if (hasPayment && amount.gt(0)) {
        status = WITHDRAW_STATUS_PENDING
      }

      if (hasPayment === false && toBN(sender).isZero() === false) {
        status = WITHDRAW_STATUS_COMPLETE
      }

      return {
        hashedCode,
        status,
        amount: paymentAmount,
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
  async cancelOTL(hashedCode: string, txCallbacks: {} = {}): Promise<TransactionReceipt> {
    // check if already canceled
    const isValid = await this.isPaymentLinkAvailable(hashedCode)
    if (isValid) {
      const cancelOtlCall = this.oneTimePaymentsContract.methods.cancel(hashedCode)
      return this.sendTransaction(cancelOtlCall, txCallbacks)
    }
  }

  async collectInviteBounties() {
    const tx = this.invitesContract.methods.collectBounties()
    const nativeBalance = await this.balanceOfNative()
    const gas = Math.min(2000000, nativeBalance / this.gasPrice - 150000) //convert to gwei and leave 150K gwei for user
    // we need around 400k gas to collect 1 bounty, so that's the minimum
    if (gas < 400000) {
      log.error('collectInvites low gas:', '', '', { gas, nativeBalance })
      throw new Error('There is not enough gas to collect bounty.')
    }
    const res = await this.sendTransaction(tx, {}, { gas })
    return res
  }

  // eslint-disable-next-line require-await
  async canCollectBountyFor(invitees) {
    const { methods } = this.invitesContract

    if (invitees.length === 0) {
      return {}
    }

    const calls = invitees.reduce(
      (calls, addr) => ({
        ...calls,
        [addr]: methods.canCollectBountyFor(addr),
      }),
      {},
    )

    // entitelment is separate because it depends on msg.sender
    const [[result]] = await retryCall(() => this.multicallFuse.all([[calls]]))

    return result
  }

  async isBountyClaimed() {
    const invitee = this.account

    // if all conditions are met during the join of an invitee the invite bounty is already collected
    // so we need to verify if that happened
    const alreadyCollected = await retryCall(() =>
      this.invitesContract.methods
        .users(invitee)
        .call()
        .then(user => user.bountyPaid),
    )

    return alreadyCollected
  }

  async collectInviteBounty(invitee) {
    try {
      const bountyFor = invitee || this.account
      const tx = this.invitesContract.methods.bountyFor(bountyFor)
      const result = await this.sendTransaction(tx)

      return result
    } catch (e) {
      log.warn('collectInviteBounty failed:', e.message, e)
      throw e
    }
  }

  async isInviterCodeValid(inviterCode) {
    try {
      const byteCode = inviterCode.startsWith('0x') ? inviterCode : this.wallet.utils.fromUtf8(inviterCode)
      const registered = await retryCall(() => this.invitesContract.methods.codeToUser(byteCode).call())

      return registered !== NULL_ADDRESS
    } catch (e) {
      log.error('isInviterCodeValid failed:', e.message, e)
      return false
    }
  }

  async hasJoinedInvites(): [boolean, string, string] {
    try {
      const user = await retryCall(() => this.invitesContract.methods.users(this.account).call())

      return [parseInt(user.joinedAt) > 0, user.invitedBy, user.inviteCode]
    } catch (e) {
      log.error('hasJoinedInvites failed:', e.message, e)
      return [false, null, null]
    }
  }

  async joinInvites(inviter, codeLength = 10) {
    try {
      const [hasJoined, invitedBy, inviteCode] = await this.hasJoinedInvites()

      let myCode = hasJoined
        ? inviteCode
        : this.wallet.utils.fromUtf8(bs58.encode(Buffer.from(this.account.slice(2), 'hex')).slice(0, codeLength))

      const myCodeUtf8 = this.wallet.utils.toUtf8(myCode)

      // prevent bug of self invite
      if (myCodeUtf8 === inviter) {
        inviter = undefined
      }

      // check under which account invitecode is registered, maybe we have a collission
      const registered = !hasJoined && (await retryCall(() => this.invitesContract.methods.codeToUser(myCode).call()))
      const inviterCode = inviter && this.wallet.utils.fromUtf8(inviter)

      log.debug('joinInvites:', {
        inviter,
        registered,
        myCode,
        codeLength,
        hasJoined,
        invitedBy,
        inviteCode,
      })

      // code collision
      if (hasJoined === false && registered.toLowerCase() !== this.account && registered !== NULL_ADDRESS) {
        log.warn('joinInvites code collision:', { inviter, myCode, codeLength, registered })
        return this.joinInvites(inviter, codeLength + 1)
      }

      // not registered or not marked inviter
      // NOTE: removed not registered for campaign codes with NULL_ADDRESS
      if (!hasJoined || invitedBy === NULL_ADDRESS) {
        const tx = this.invitesContract.methods.join(myCode, inviter ? inviterCode : '0x0'.padEnd(66, 0))

        log.debug('joinInvites registering:', { inviter, myCode, inviteCode, hasJoined, codeLength, registered })

        await this.sendTransaction(tx).catch(e => {
          log.error('joinInvites failed:', e.message, e, { inviter, myCode, codeLength, registered })
          throw e
        })
      }

      // already registered
      return myCodeUtf8
    } catch (e) {
      log.warn('joinInvites failed:', e.message, e)
      throw e
    }
  }

  toDecimals(wei, chainOrToken = null) {
    return toDecimals(wei, chainOrToken ?? this.networkId)
  }

  fromDecimals(amount, chainOrToken = null) {
    return fromDecimals(amount, chainOrToken ?? this.networkId)
  }

  async getUserInviteBounty() {
    const { invitesContract, account } = this
    const { methods } = invitesContract

    const user = await safeCall(() => methods.users(account), { level: 0 })
    const level = await safeCall(() => methods.levels(user.level))
    const bounty = Number(this.toDecimals(get(level, 'bounty', 10000)))

    return { bounty, user, level }
  }

  async getUserInvites() {
    const { invitesContract, account, multicallFuse } = this
    const { methods } = invitesContract

    const callsMap = {
      invitees: 'getInvitees',
      pending: 'getPendingInvitees',
      totalPendingBounties: 'getPendingBounties',
    }

    // entitelment is separate because it depends on msg.sender
    const calls = mapValues(callsMap, method => methods[method](account))
    const [[result]] = await retryCall(() => multicallFuse.all([[calls]]))

    result.totalPendingBounties = Number(result.totalPendingBounties)
    return result
  }

  // eslint-disable-next-line require-await
  async fetchGasPrice() {
    return this.wallet.eth.getGasPrice().then(Number)
  }

  async getGasPrice(): Promise<number> {
    let gasPrice = this.gasPrice

    try {
      const networkGasPrice = await retryCall(() => this.fetchGasPrice().then(toBN))

      if (networkGasPrice.gt(toBN('0'))) {
        gasPrice = networkGasPrice.toString()
      }
    } catch (e) {
      log.error('failed to retrieve gas price from network', e.message, e, { category: ExceptionCategory.Blockhain })
    }

    return gasPrice
  }

  // eslint-disable-next-line require-await
  async sendAmount(to: string, amount: number, callbacks: PromiEvents): Promise<TransactionReceipt> {
    return this.sendAmountWithData(to, amount, null, callbacks)
  }

  async sendAmountWithData(
    to: string,
    amount: number,
    data: string,
    callbacks: PromiEvents,
  ): Promise<TransactionReceipt> {
    if (!this.wallet.utils.isAddress(to)) {
      throw new Error('Address is invalid')
    }

    if (amount === 0 || !(await this.canSend(amount))) {
      throw new Error('Amount is bigger than balance')
    }

    log.info({ amount, to, data })
    const transferCall = data
      ? this.tokenContract.methods.transferAndCall(to, amount.toString(), this.wallet.utils.toHex(data))
      : this.tokenContract.methods.transfer(to, amount.toString()) // retusn TX object (not sent to the blockchain yet)

    return this.sendTransaction(transferCall, callbacks) // Send TX to the blockchain
  }

  async sendNativeAmount(to: string, amount: number, callbacks: PromiEvents): Promise<TransactionReceipt> {
    if (!this.wallet.utils.isAddress(to)) {
      throw new Error('Address is invalid')
    }

    if (amount === 0 || !(await this.canSendNative(amount))) {
      throw new Error('Amount is bigger than balance')
    }

    const txData = {
      to,
      from: this.account,
      value: amount.toString(),
    }

    log.info('prepared native tx:', txData)

    return this.sendNativeTransaction(txData, callbacks) // Send TX to the blockchain
  }

  /**
   * Helper to check if user has enough native token balance, if not try to ask server to topwallet
   * @param {number} wei
   * @param {object} options
   */
  async verifyHasGas(wei: number, options = {}) {
    const TOP_GWEI = 100000 * this.gasPrice //the gas fee for topWallet faucet call
    const minWei = wei ? wei : 200000 * this.gasPrice

    const release = await gasMutex.lock()

    try {
      const { topWallet = true } = options

      let nativeBalance = await this.balanceOfNative()
      let hasBalance = nativeBalance >= minWei

      // also request for gas if we wont have enough after TX to do a refill
      let noGasAfterTx = topWallet && nativeBalance - minWei < TOP_GWEI

      if (hasBalance && !noGasAfterTx) {
        return {
          ok: true,
        }
      }

      if (!hasBalance && !topWallet) {
        // !hasbalance is just to make it readable, it was tested in previous if
        return {
          ok: false,
        }
      }

      // self serve using faucet. we verify nativeBalance to prevent loop with sendTransaction which calls this function also
      const canTop = await retryCall(() => this.faucetContract.methods.canTop(this.account).call())

      if (canTop && nativeBalance >= TOP_GWEI) {
        log.info('verifyHasGas using faucet...')

        const toptx = this.faucetContract.methods.topWallet(this.account)
        const ok = await this.sendTransaction(toptx, undefined, {
          isVerifyHasGas: true,
          gas: await toptx.estimateGas().catch(e => Math.min(170000, (nativeBalance / this.gasPrice).toFixed(0))),
        })
          .then(_ => true)
          .catch(e => {
            log.error('verifyHasGas faucet failed', e.message, e)
            return false
          })

        if (ok) {
          return { ok: ok || hasBalance }
        }
      }

      // if we cant use faucet or it failed then fallback to adminwallet api
      log.info('verifyHasGas no gas, asking for top wallet from server', {
        hasBalance,
        nativeBalance,
        required: minWei,
        address: this.account,
      })

      const toppingRes = await API.verifyTopWallet(this.networkId)
      const { data } = toppingRes

      if (!data || data.ok !== 1) {
        return {
          ok: false || hasBalance,
          error:
            !data || (data.error && !~data.error.indexOf(`User doesn't need topping`)) || data.sendEtherOutOfSystem,
          message: get(data, 'error'),
        }
      }

      nativeBalance = await this.balanceOfNative()

      return {
        ok: data.ok && nativeBalance > minWei,
      }
    } catch (e) {
      log.error('verifyHasGas failed:', e.message, e, { minWei })

      return {
        ok: false,
        error: true,
        message: e.message,
      }
    } finally {
      release()
    }
  }

  // eslint-disable-next-line require-await
  async signTransaction(tx) {
    return this.accounts[0].signTransaction(tx)
  }

  // eslint-disable-next-line require-await
  async sendRawTransaction(tx, tempWeb3, callbacks = {}) {
    tempWeb3.eth.accounts.wallet.add(this.accounts[0])
    log.debug('sendRawTransaction', { tx })
    const promiEvent = tempWeb3.eth.sendTransaction(tx)
    callbacks.onTransactionHash && promiEvent.on('transactionHash', callbacks.onTransactionHash)
    callbacks.onError && promiEvent.on('error', callbacks.onError)
    callbacks.onReceipt && promiEvent.on('receipt', callbacks.onReceipt)
    return promiEvent
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
    { gas: setgas, gasPrice, isVerifyHasGas }: GasValues = {
      gas: undefined,
      gasPrice: undefined,
      isVerifyHasGas: false,
    },
  ) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = { ...defaultPromiEvents, ...txCallbacks }
    let gas = setgas

    if (!gas) {
      //estimate gas and add 40k for non deterministic writes (required for example when GOOD minting happens)
      try {
        gas = await tx.estimateGas().then(cost => (Number(cost) + 40000).toFixed(0))
      } catch (e) {
        if (e.message.toLowerCase().includes('revert')) {
          log.warn('sendTransaction gas estimate reverted:', e.message, e, {
            method: tx._method?.name,
            tx: tx._method,
          })
          return Promise.reject(e)
        }
        log.debug('sendTransaction gas estimate failed, using default gas', e.message, e)
      }
    }

    if (!gas) {
      gas = Math.min(Config.defaultTxGas, await this.balanceOfNative().then(_ => _ / this.gasPrice))
    }

    gasPrice = gasPrice || this.gasPrice

    if (this.network === 'develop' && setgas === undefined) {
      gas *= 2
    }

    log.debug('sendTransaction:', { gas, gasPrice })

    if (isVerifyHasGas !== true) {
      // prevent recursive endless loop when sendTransaction call came from verifyHasGas
      const { ok, error, message } = await this.verifyHasGas(gas * gasPrice)

      if (ok === false) {
        return Promise.reject(
          error
            ? new Error(`sendTransaction verifyHasGas failed: ${message}`)
            : new Error('Reached daily transactions limit or not a citizen'),
        )
      }
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
          this._notifyReceipt(r.transactionHash) // although receipt will be received by polling, we do this anyways immediately
          this.notifyBalanceChanged()

          onReceipt && onReceipt(r)
        })
        .on('confirmation', c => {
          log.debug('got confirmation', c)
          onConfirmation && onConfirmation(c)
        })
        .on('error', e => {
          log.warn('sendTransaction error:', e.message, e, {
            tx: getTxLogArgs(tx),
            category: ExceptionCategory.Blockhain,
          })
          rej(e)
          onError && onError(e)
        })
    })

    return res
  }

  // eslint-disable-next-line require-await
  async sendNativeTransaction(txData: any, txCallbacks: PromiEvents = defaultPromiEvents) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = { ...defaultPromiEvents, ...txCallbacks }

    return new Promise((resolve, reject) => {
      this.wallet.eth
        .sendTransaction({ gas: FIXED_SEND_GAS, ...txData })
        .on('transactionHash', hash => {
          log.debug('got txhash', hash)
          onTransactionHash(hash) // is empty fn by default
        })
        .on('receipt', receipt => {
          log.debug('got receipt', receipt)
          resolve(receipt)
          onReceipt(receipt)
        })
        .on('confirmation', confirmation => {
          log.debug('got confirmation', confirmation)
          this.notifyBalanceChanged()
          onConfirmation(confirmation)
        })
        .on('error', exception => {
          log.error('sendNativeTransaction error:', exception.message, exception, {
            tx: txData,
            category: ExceptionCategory.Blockhain,
          })

          reject(exception)
          onError(exception)
        })
    })
  }

  async isKnownAddress(address) {
    const nonce = await this.wallet.eth.getTransactionCount(address)

    return nonce > 0
  }

  // eslint-disable-next-line require-await
  async getContractName(address) {
    const lcAddress = address.toLowerCase()
    const checksum = this.wallet.utils.toChecksumAddress(address)
    const findByKey = contracts => findKey(contracts, key => [lcAddress, checksum].includes(key))
    const contractName = first(filter(values(ContractsAddress).map(findByKey)))

    if (!contractName) {
      const proxy = await this.getContractProxy(address)

      return API.getContractName(proxy, this.networkId)
    }

    return contractName
  }

  async getContractProxy(address, web3 = this.wallet) {
    const implStorage = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    const result = await web3.eth.getStorageAt(address, implStorage)

    if (Number(result) === 0) {
      return address
    }

    // verify first 12 bytes are 0
    if (result.search(/^0x0{24}/) < 0) {
      return address
    }

    const addr = '0x' + result.slice(26)

    try {
      return this.wallet.utils.toChecksumAddress(addr)
    } catch (e) {
      return address
    }
  }
}

export const WalletType = GoodWallet.WalletType
export type AccountUsage = $Keys<typeof GoodWallet.AccountUsageToPath>
