// @flow
import Web3 from 'web3'
import HDKey from 'hdkey'
import bip39 from 'bip39-light'
import type { HttpProvider, WebSocketProvider } from 'web3-core'
import IdentityABI from '@gooddollar/goodcontracts/build/contracts/Identity.min.json'
import GoodDollarABI from '@gooddollar/goodcontracts/build/contracts/GoodDollar.min.json'
import ProxyContractABI from '@gooddollar/goodcontracts/build/contracts/AdminWallet.min.json'
import ContractsAddress from '@gooddollar/goodprotocol/releases/deployment.json'

import moment from 'moment'
import get from 'lodash/get'
import assign from 'lodash/assign'
import Mutex from 'await-mutex'
import * as web3Utils from 'web3-utils'
import logger from '../../../../lib/logger/js-logger'
import conf from '../../../../config/config'
import { type TransactionReceipt } from './blockchain-types'

conf.mnemonic = process.env.REACT_APP_ADMIN_MNEMONIC
const networks = conf.ethereum
const network = conf.network
const networkId = ContractsAddress[network].networkId
conf.ethNetwork = networks[networkId]
const log = logger.child({ from: 'AdminWallet' })

const defaultGasPrice = web3Utils.toWei('1', 'gwei')
const adminMinBalance = 100000

/**
 * Exported as AdminWallet
 * Interface with blockchain contracts via web3 using HDWalletProvider
 */
export class Wallet {
  web3: Web3

  wallet: HDWallet

  accountsContract: Web3.eth.Contract

  tokenContract: Web3.eth.Contract

  identityContract: Web3.eth.Contract

  UBIContract: Web3.eth.Contract

  proxyContract: Web3.eth.Contract

  address: string

  networkId: number

  network: string

  mnemonic: string

  nonce: number

  addresses: Array<string>

  filledAddresses: Array<string>

  constructor(mnemonic: string) {
    this.mnemonic = mnemonic
    this.addresses = []
    this.filledAddresses = []
    this.wallets = {}
    this.numberOfAdminWalletAccounts = 2
    this.mutex = new Mutex()
    this.ready = this.init()
  }

  getWeb3TransportProvider(): HttpProvider | WebSocketProvider {
    const provider = conf.ethNetwork.httpWeb3provider + conf.infuraKey
    const web3Provider = new Web3.providers.HttpProvider(provider)
    log.debug({ conf, web3Provider, provider })
    return web3Provider
  }

  addWallet(account) {
    this.web3.eth.accounts.wallet.add(account)
    this.web3.eth.defaultAccount = account.address
    this.addresses.push(account.address)
    this.wallets[account.address] = account
  }

  async init() {
    log.debug('Initializing wallet:', { mnemonic: this.mnemonic, conf: conf.ethereum, network })

    this.web3 = new Web3(this.getWeb3TransportProvider(), null, {
      defaultBlock: 'latest',
      defaultGasPrice,
      transactionBlockTimeout: 5,
      transactionConfirmationBlocks: 1,
      transactionPollingTimeout: 30,
    })
    assign(this.web3.eth, {
      defaultBlock: 'latest',
      defaultGasPrice,
      transactionBlockTimeout: 5,
      transactionConfirmationBlocks: 1,
      transactionPollingTimeout: 30,
    })
    if (conf.privateKey) {
      let account = this.web3.eth.accounts.privateKeyToAccount(conf.privateKey)
      this.web3.eth.accounts.wallet.add(account)
      this.web3.eth.defaultAccount = account.address
      this.address = account.address
      this.addWallet(account)
      log.info('Initialized by private key:', { address: account.address })
    } else if (this.mnemonic) {
      let root = HDKey.fromMasterSeed(bip39.mnemonicToSeed(this.mnemonic))
      for (let i = 0; i < this.numberOfAdminWalletAccounts; i++) {
        const path = "m/44'/60'/0'/0/" + i
        let addrNode = root.derive(path)
        let account = this.web3.eth.accounts.privateKeyToAccount('0x' + addrNode._privateKey.toString('hex'))
        this.addWallet(account)
      }
      log.info('Initialized by mnemonic:', { address: this.addresses })
    }
    this.network = conf.network
    this.networkId = conf.ethNetwork.network_id
    const adminWalletAddress = get(ContractsAddress, `${this.network}.AdminWallet`)
    this.proxyContract = new this.web3.eth.Contract(ProxyContractABI.abi, adminWalletAddress, { from: this.address })

    const adminWalletContractBalance = await this.web3.eth.getBalance(adminWalletAddress)
    log.info(`AdminWallet contract balance`, { adminWalletContractBalance, adminWalletAddress })

    if (adminWalletContractBalance < adminMinBalance * this.addresses.length) {
      const exception = new Error('AdminWallet contract low funds')

      log.error('Failed start GoodWallet', exception.message, exception)

      if (conf.env !== 'test') {
        process.exit(-1)
      }
    }

    // await this.topAdmins
    // log.info('topped admins ok')
    log.info('checking admin addresses:', this.addresses)
    for (let addr of this.addresses) {
      // eslint-disable-next-line no-await-in-loop
      const balance = await this.web3.eth.getBalance(addr)
      // eslint-disable-next-line no-await-in-loop
      const isAdminWallet = await this.isVerifiedAdmin(addr)
      if (isAdminWallet && parseInt(balance) > adminMinBalance) {
        log.info(`admin wallet ${addr} balance ${balance}`)
        this.filledAddresses.push(addr)
      } else {
        log.warn('Failed adding admin wallet', { addr, balance, isAdminWallet, adminMinBalance })
      }
    }

    if (this.filledAddresses.length === 0) {
      const exception = new Error('No admin wallet with funds')

      log.error('Failed start GoodWallet', exception.message, exception)

      if (conf.env !== 'test') {
        process.exit(-1)
      }
    }

    this.address = this.filledAddresses[0]

    this.identityContract = new this.web3.eth.Contract(
      IdentityABI.abi,
      get(ContractsAddress, `${this.network}.Identity`),
      { from: this.address },
    )

    this.tokenContract = new this.web3.eth.Contract(
      GoodDollarABI.abi,
      get(ContractsAddress, `${this.network}.GoodDollar`),
      { from: this.address },
    )

    try {
      let gdbalance = await this.tokenContract.methods.balanceOf(this.address).call()
      let nativebalance = await this.web3.eth.getBalance(this.address)
      this.nonce = parseInt(await this.web3.eth.getTransactionCount(this.address))
      log.debug('AdminWallet Ready:', {
        account: this.address,
        gdbalance,
        nativebalance,
        networkId: this.networkId,
        network: this.network,
        nonce: this.nonce,
        ContractsAddress: ContractsAddress[this.network],
      })
    } catch (e) {
      log.error('Error initializing wallet', e.message, e)
      if (conf.env !== 'test') {
        process.exit(-1)
      }
    }
    return true
  }

  /**
   * top admin wallet accounts
   * @param {object} event callbacks
   * @returns {Promise<String>}
   */
  topAdmins({ onReceipt, onTransactionHash, onError }): Promise<any> {
    return this.sendTransaction(
      this.proxyContract.methods.topAdmins(0),
      {
        onTransactionHash,
        onReceipt,
        onError,
      },
      { gas: '200000' }, // gas estimate for this is very high so we limit it to prevent failure
    )
  }

  /**
   * charge bonuses for user via `bonus` contract
   * @param {string} address
   * @param {string} amountInWei
   * @param {object} event callbacks
   * @returns {Promise<String>}
   */
  redeemBonuses(address: string, amountInWei: string, { onReceipt, onTransactionHash, onError }): Promise<any> {
    return this.sendTransaction(this.proxyContract.methods.awardUser(address, amountInWei), {
      onTransactionHash,
      onReceipt,
      onError,
    })
  }

  /**
   * whitelist an user in the `Identity` contract
   * @param {string} address
   * @param {string} did
   * @returns {Promise<TransactionReceipt>}
   */
  async whitelistUser(address: string, did: string): Promise<TransactionReceipt | boolean> {
    const isVerified = await this.isVerified(address)
    if (isVerified) {
      return { status: true }
    }
    const tx: TransactionReceipt = await this.sendTransaction(this.proxyContract.methods.whitelist(address, did)).catch(
      e => {
        log.error('Error whitelistUser', e.message, e, { address, did })
        throw e
      },
    )
    log.info('Whitelisted user', { address, did, tx })
    return tx
  }

  /**
   * blacklist an user in the `Identity` contract
   * @param {string} address
   * @returns {Promise<TransactionReceipt>}
   */
  async blacklistUser(address: string): Promise<TransactionReceipt> {
    const tx: TransactionReceipt = await this.sendTransaction(
      this.identityContract.methods.addBlacklisted(address),
    ).catch(e => {
      log.error('Error blackListUser', e.message, e, { address })
      throw e
    })

    return tx
  }

  /**
   * remove a user in the `Identity` contract
   * @param {string} address
   * @returns {Promise<TransactionReceipt>}
   */
  async removeWhitelisted(address: string): Promise<TransactionReceipt> {
    const tx: TransactionReceipt = await this.sendTransaction(
      this.proxyContract.methods.removeWhitelist(address),
    ).catch(e => {
      log.error('Error removeWhitelisted', e.message, e, { address })
      throw e
    })

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
        log.error('Error isVerified', e.message, e)
        throw e
      })
    return tx
  }

  /**
   *
   * @param {string} address
   * @returns {Promise<boolean>}
   */
  async isVerifiedAdmin(address: string): Promise<boolean> {
    const tx: boolean = await this.proxyContract.methods
      .isAdmin(address)
      .call()
      .catch(e => {
        log.error('Error isAdmin', e.message, e)
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
    force: boolean = false,
  ): PromiEvent<TransactionReceipt> {
    let daysAgo = moment().diff(moment(lastTopping), 'days')
    if (conf.env !== 'development' && daysAgo < 1) {
      throw new Error('Daily limit reached')
    }
    try {
      let userBalance = await this.web3.eth.getBalance(address)
      let maxTopWei = parseInt(web3Utils.toWei('6000000', 'gwei'))
      let toTop = maxTopWei - userBalance
      log.debug('TopWallet:', { address, userBalance, toTop })
      if (toTop > 0 && (force || toTop / maxTopWei >= 0.75)) {
        let res = await this.sendTransaction(this.proxyContract.methods.topWallet(address))
        log.debug('Topwallet result:', { res })
        return res
      }
      log.debug("User doesn't need topping")
      return { status: 1 }
    } catch (e) {
      log.error('Error topWallet', e.message, e, { address, lastTopping, force })
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
        log.error('Error getBalance', e.message, e)
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
    { gas, gasPrice }: GasValues = { gas: undefined, gasPrice: undefined },
  ) {
    const { onTransactionHash, onReceipt, onConfirmation, onError } = txCallbacks
    gas = gas || (await tx.estimateGas().then(gas => gas + 50000))
    gasPrice = gasPrice || defaultGasPrice

    let release = await this.mutex.lock()
    this.nonce = parseInt(await this.web3.eth.getTransactionCount(this.address))
    log.debug('sending tx:', { gas, gasPrice, nonce: this.nonce })
    return new Promise((res, rej) => {
      tx.send({ gas, gasPrice, chainId: this.networkId, nonce: this.nonce, from: this.address })
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
}

const AdminWallet = new Wallet(conf.mnemonic)
export default AdminWallet
