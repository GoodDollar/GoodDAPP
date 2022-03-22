// @flow
import Web3 from 'web3'
import bip39 from 'bip39-light'
import { assign } from 'lodash'
import AsyncStorage from '../utils/asyncStorage'
import Config from '../../config/config'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC, GD_USER_PRIVATEKEYS } from '../constants/localStorage'
import logger from '../logger/js-logger'
import type { WalletConfig } from './WalletFactory'
import MultipleAddressWallet from './MultipleAddressWallet'

const log = logger.child({ from: 'SoftwareWalletProvider' })
const { WebsocketProvider, HttpProvider } = Web3.providers

/**
 * save mnemonics (secret phrase) to user device
 * @param {string} mnemonics
 */
export function saveMnemonics(mnemonics: string): Promise<any> {
  return AsyncStorage.setItem(GD_USER_MNEMONIC, mnemonics)
}

/**
 * get user mnemonics stored on device or generate a new one
 */
export async function getMnemonics(): Promise<string> {
  let pkey = (await AsyncStorage.getItem(GD_USER_MASTERSEED)) || (await AsyncStorage.getItem(GD_USER_MNEMONIC))

  if (pkey) {
    log.info('pkey found, creating account from pkey:', { pkey })
  } else {
    pkey = generateMnemonic()
    saveMnemonics(pkey)
    log.info('item set in localStorage ', { pkey })
  }

  return pkey
}

export function mnemonicsToObject(pkey) {
  return { ...pkey.split(' ') }
}

export async function getMnemonicsObject(): Promise<any> {
  const pkey = await getMnemonics()

  return mnemonicsToObject(pkey)
}

export function deleteMnemonics(): Promise<any> {
  return AsyncStorage.removeItem(GD_USER_MNEMONIC)
}

function generateMnemonic(): string {
  return bip39.generateMnemonic()
}

class SoftwareWalletProvider {
  ready: Promise<Web3>

  defaults = {
    defaultBlock: 'latest',

    // defaultGas: 140000,
    defaultGasPrice: 1000000,
    transactionBlockTimeout: 2,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 30,
    transactionPollingInterval: 3000,
  }

  conf: WalletConfig

  constructor(conf: WalletConfig) {
    this.conf = conf
    this.ready = this.initSoftwareWallet()
  }

  async initSoftwareWallet(): Promise<Web3> {
    let provider = this.getWeb3TransportProvider()
    log.info('wallet config:', this.conf, provider)

    //let web3 = new Web3(new WebsocketProvider("wss://ropsten.infura.io/ws"))
    let pkey: ?string = this.conf.mnemonic || (await getMnemonics())
    let privateKeys = await AsyncStorage.getItem(GD_USER_PRIVATEKEYS)

    //we start from addres 1, since from address 0 pubkey all public keys can  be generated
    //and we want privacy
    if (privateKeys == null) {
      let mulWallet = new MultipleAddressWallet(pkey, 10)
      privateKeys = mulWallet.wallets
      log.debug('Generating private keys from hdwallet', { privateKeys })
      AsyncStorage.setItem(GD_USER_PRIVATEKEYS, privateKeys)
    } else {
      log.debug('Existing private keys found')
    }

    let web3 = new Web3(provider, null, this.defaults)

    assign(web3.eth, this.defaults)
    privateKeys.forEach(pkey => {
      let wallet = web3.eth.accounts.privateKeyToAccount(pkey)
      web3.eth.accounts.wallet.add(wallet)
    })
    web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address
    return web3
  }

  getWeb3TransportProvider(): HttpProvider | WebSocketProvider {
    const { web3Transport, websocketWeb3Provider } = this.conf
    const wsOptions = { timeout: 10000, reconnectDelay: 2000 }

    switch (web3Transport) {
      case 'WebSocketProvider':
        return new WebsocketProvider(websocketWeb3Provider, wsOptions)
      default:
        return this._createHttpProvider()
    }
  }

  /** @private */
  _createHttpProvider() {
    const { httpWeb3provider } = this.conf
    const backend = ['infura', 'pokt'].find(server => httpWeb3provider.includes(server))

    let provider = httpWeb3provider
    let options = {}

    switch (backend) {
      case 'infura':
        provider += Config.infuraKey
        break
      case 'pokt':
        options = { headers: [{ name: 'X-Wallet-Application', value: 'GoodDollarWallet' }] }
        break
      default:
        break
    }

    return new HttpProvider(provider, options)
  }
}

export default SoftwareWalletProvider
