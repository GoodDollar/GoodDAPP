// @flow
import Web3 from 'web3'
import HDKey from 'hdkey'
import bip39 from 'bip39-light'
import type { HttpProvider, WebSocketProvider } from 'web3-providers'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.json'
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.json'
import ContractsAddress from '@gooddollar/goodcontracts/releases/deployment.json'
import moment from 'moment'
import { get } from 'lodash'
import Mutex from 'await-mutex'
import * as web3Utils from 'web3-utils'
import logger from '../../../logger/pino-logger'
import conf from '../../../../config/config'
import { type TransactionReceipt } from './blockchain-types'

conf.mnemonic = process.env.REACT_APP_ADMIN_MNEMONIC
const networks = conf.ethereum
const network = conf.network
const networkId = ContractsAddress[network].networkId
conf.ethNetwork = networks[networkId]

const log = logger.child({ from: 'AdminWallet' })

/**
 * Exported as AdminWallet
 * Interface with blockchain contracts via web3 using HDWalletProvider
 */
export class Wallet {
  web3: Web3

  wallet: HDWallet

  tokenContract: Web3.eth.Contract

  identityContract: Web3.eth.Contract

  claimContract: Web3.eth.Contract

  address: string

  networkId: number

  mnemonic: string

  nonce: number

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic
    this.ready = this.init()
    this.mutex = new Mutex()
  }

  getWeb3TransportProvider(): HttpProvider | WebSocketProvider {
    let provider
    let web3Provider
    let transport = 'HttpProvider'
    switch (transport) {
      case 'WebSocket':
        provider = conf.ethNetwork.websocketWeb3Provider
        web3Provider = new Web3.providers.WebsocketProvider(provider)
        break

      case 'HttpProvider':
        provider = conf.ethNetwork.httpWeb3provider + conf.infuraKey
        web3Provider = new Web3.providers.HttpProvider(provider)
        break

      default:
        provider = conf.ethNetwork.httpWeb3provider + conf.infuraKey
        web3Provider = new Web3.providers.HttpProvider(provider)
        break
    }
    log.debug({ conf, web3Provider, provider })

    return web3Provider
  }

  async init() {
    log.debug('Initializing wallet:', { conf: conf.ethNetwork })

    this.web3 = new Web3(this.getWeb3TransportProvider(), null, {
      defaultBlock: 'latest',
      defaultGas: 200000,
      defaultGasPrice: 1000000,
      transactionBlockTimeout: 5,
      transactionConfirmationBlocks: 1,
      transactionPollingTimeout: 30,
    })
    if (conf.privateKey) {
      let account = this.web3.eth.accounts.privateKeyToAccount(conf.privateKey)
      this.web3.eth.accounts.wallet.add(account)
      this.web3.eth.defaultAccount = account.address
      this.address = account.address
      log.debug('Initialized by private key:', account.address)
    } else if (conf.mnemonic) {
      let root = HDKey.fromMasterSeed(bip39.mnemonicToSeed(this.mnemonic))
      var path = "m/44'/60'/0'/0/0"
      let addrNode = root.derive(path)
      let account = this.web3.eth.accounts.privateKeyToAccount('0x' + addrNode._privateKey.toString('hex'))
      this.web3.eth.accounts.wallet.add(account)
      this.web3.eth.defaultAccount = account.address
      this.address = account.address
      log.debug('Initialized by mnemonic:', account.address)
    }
    this.network = conf.network
    this.networkId = conf.ethNetwork.network_id
    this.gasPrice = web3Utils.toWei('2', 'gwei')
    this.identityContract = new this.web3.eth.Contract(
      IdentityABI.abi,
      get(ContractsAddress, `${this.network}.Identity` /*IdentityABI.networks[this.networkId].address*/),
      {
        from: this.address,
        gas: 500000,
        gasPrice: web3Utils.toWei('2', 'gwei'),
      }
    )

    this.tokenContract = new this.web3.eth.Contract(
      GoodDollarABI.abi,
      get(ContractsAddress, `${this.network}.GoodDollar` /*GoodDollarABI.networks[this.networkId].address*/),
      {
        from: this.address,
        gas: 500000,
        gasPrice: web3Utils.toWei('1', 'gwei'),
      }
    )

    try {
      let gdbalance = await this.tokenContract.methods.balanceOf(this.address).call()
      let nativebalance = await this.web3.eth.getBalance(this.address)
      this.nonce = parseInt(await this.web3.eth.getTransactionCount(this.address))
      log.debug('AdminWallet Ready:', {
        account: this.address,
        gdbalance,
        nativebalance,
        network: this.networkId,
        nonce: this.nonce,
        provider: this.getWeb3TransportProvider(),
      })
    } catch (e) {
      log.error('Error initializing wallet', { e }, e.message)
    }
    return true
  }

  /**
   * whitelist an user in the `Identity` contract
   * @param {string} address
   * @param {string} did
   * @returns {Promise<TransactionReceipt>}
   */
  async whitelistUser(address: string, did: string): Promise<TransactionReceipt> {
    const tx: TransactionReceipt = await this.sendTransaction(
      this.identityContract.methods.addWhitelistedWithDID(address, did)
    ).catch(e => {
      log.error('Error whitelistUser', { e }, e.message)
      throw e
    })
    log.info('Whitelisted user', { address, did, tx })
    return tx
  }

  async blacklistUser(address: string): Promise<TransactionReceipt> {
    const tx: TransactionReceipt = await this.sendTransaction(
      this.identityContract.methods.addBlacklisted(address)
    ).catch(e => {
      log.error('Error blacklistUser', { e }, e.message)
      throw e
    })
    log.info('Blacklisted user', { address, tx })
    return tx
  }

  /**
   * verify if an user is verified in the `Identity` contract
   * @param {string} address
   * @returns {Promise<boolean>}
   */
  async isVerified(address: string): Promise<boolean> {
    const tx: boolean = await this.identityContract.methods
      .isWhitelisted(address)
      .call()
      .catch(e => {
        log.error('Error isVerified', { e }, e.message)
        throw e
      })
    return tx
  }

  async isBlacklisted(address: string): Promise<boolean> {
    const tx: boolean = await this.identityContract.methods
      .isBlacklisted(address)
      .call()
      .catch(e => {
        log.error('Error isBlacklisted', { e }, e.message)
        throw e
      })
    return tx
  }

  /**
   * top wallet if needed
   * @param {string} address
   * @param {moment.Moment} lastTopping
   * @param {boolean} force
   * @returns {PromiEvent<TransactionReceipt>}
   */
  async topWallet(
    address: string,
    lastTopping?: moment.Moment = moment().subtract(1, 'day'),
    force: boolean = false
  ): PromiEvent<TransactionReceipt> {
    let daysAgo = moment().diff(moment(lastTopping), 'days')
    if (conf.env !== 'development' && daysAgo < 1) {
      throw new Error('Daily limit reached')
    }
    try {
      const isVerified = force || (await this.isVerified(address))
      if (isVerified) {
        let userBalance = await this.web3.eth.getBalance(address)
        let toTop = parseInt(web3Utils.toWei('10000000', 'gwei')) - userBalance
        log.debug('TopWallet:', { userBalance, toTop })
        if (force || toTop / 10000000 >= 0.75) {
          let res = await this.sendNative({
            from: this.address,
            to: address,
            value: toTop,
            gas: 1000000,
            gasPrice: web3Utils.toWei('1', 'gwei'),
          })
          log.debug('Topwallet result:', res)
          return res
        }
      } else {
        throw new Error(`User not verified: ${address} ${isVerified}`)
      }
    } catch (e) {
      log.error('Error topWallet', { e }, e.message)
      throw e
    }
  }

  getAddressBalance(address: string): Promise<number> {
    return this.web3.eth.getBalance(address)
  }

  /**
   * get balance for admin wallet
   * @returns {Promise<number>}
   */
  getBalance(): Promise<number> {
    return this.getAddressBalance(this.address)
      .then(b => web3Utils.fromWei(b))
      .catch(e => {
        log.error('Error getBalance', e)
        throw e
      })
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
    txCallbacks: PromiEvents = {},
    { gas, gasPrice }: GasValues = { gas: undefined, gasPrice: undefined }
  ) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = txCallbacks
    gas = gas || (await tx.estimateGas())
    gasPrice = gasPrice || this.gasPrice

    let release = await this.mutex.lock()
    this.nonce = parseInt(await this.web3.eth.getTransactionCount(this.address))

    return new Promise((res, rej) => {
      tx.send({ gas, gasPrice, chainId: this.networkId, nonce: this.nonce })
        .on('transactionHash', h => {
          this.nonce = this.nonce + 1
          log.debug('sendTransaction nonce increased:', this.nonce)
          release()
          onTransactionHash && onTransactionHash(h)
        })
        .on('receipt', r => {
          onReceipt && onReceipt(r)
          res(r)
        })
        .on('confirmation', c => onConfirmation && onConfirmation(c))
        .on('error', e => {
          release()
          onError && onError(e)
          rej(e)
        })
    })
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
  async sendNative(
    params: { from: string, to: string, value: string },
    txCallbacks: PromiEvents = {},
    { gas, gasPrice }: GasValues = { gas: undefined, gasPrice: undefined }
  ) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = txCallbacks
    gas = gas || 100000
    gasPrice = gasPrice || this.gasPrice

    let release = await this.mutex.lock()
    this.nonce = parseInt(await this.web3.eth.getTransactionCount(this.address))

    return new Promise((res, rej) => {
      this.web3.eth
        .sendTransaction({ gas, gasPrice, chainId: this.networkId, nonce: this.nonce, ...params })
        .on('transactionHash', h => {
          this.nonce = this.nonce + 1
          log.debug('sendNative nonce increase:', this.nonce)
          release()
          onTransactionHash && onTransactionHash(h)
        })
        .on('receipt', r => {
          onReceipt && onReceipt(r)
          res(r)
        })
        .on('confirmation', c => onConfirmation && onConfirmation(c))
        .on('error', e => {
          release()
          onError && onError(e)
          rej(e)
        })
    })
  }
}

const AdminWallet = new Wallet(conf.mnemonic)
export default AdminWallet
