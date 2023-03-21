// @flow
import Web3 from 'web3'
import bip39 from 'bip39-light'
import { assign } from 'lodash'
import AsyncStorage from '../utils/asyncStorage'
import Config from '../../config/config'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC, GD_USER_PRIVATEKEYS } from '../constants/localStorage'
import logger from '../logger/js-logger'
import { isMobileNative } from '../utils/platform'
import type { WalletConfig } from './WalletFactory'
import MultipleAddressWallet from './MultipleAddressWallet'
import { MultipleHttpProvider, WebsocketProvider } from './transport'

const log = logger.child({ from: 'SoftwareWalletProvider' })

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

    defaultGasPrice: 1000000 * Config.defaultGasPrice,
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
    log.info('wallet config:', this.conf)

    let web3: Web3 = this.conf.web3
    let pkey: ?string
    if (web3) {
      pkey = await web3.eth.sign('GD_IDENTIFIERS', web3.eth.defaultAccount).then(_ => _.slice(2, 66)) //32 bytes psuedo key
    } else {
      pkey = this.conf.mnemonic || (await getMnemonics())
    }
    let privateKeys = await AsyncStorage.getItem(GD_USER_PRIVATEKEYS)

    // we start from addres 1, since from address 0 pubkey all public keys can  be generated
    // and we want privacy
    if (privateKeys == null) {
      let mulWallet = new MultipleAddressWallet(pkey, 10)

      privateKeys = mulWallet.wallets
      log.debug('Generating private keys from hdwallet', { privateKeys })

      AsyncStorage.safeSet(GD_USER_PRIVATEKEYS, privateKeys)
    } else {
      log.debug('Existing private keys found')
    }

    if (!web3) {
      let provider = this.getWeb3TransportProvider()
      web3 = new Web3(provider, null, this.defaults)
    }

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
    const { infuraKey, publicUrl } = Config
    const { httpWeb3provider, httpProviderAttempts, httpProviderStrategy } = this.conf
    const config = { attempts: httpProviderAttempts, strategy: httpProviderStrategy }

    // parsing multiple rpc urls
    const endpoints = httpWeb3provider.split(',').map(endpoint => {
      let options = {} // opts for each url separately
      let provider = endpoint
      const backend = ['infura', 'pokt'].find(server => endpoint.includes(server))

      switch (backend) {
        case 'infura':
          provider += infuraKey
          break
        case 'pokt':
          if (isMobileNative) {
            const userAgentString = `Mozilla/5.0 GoodDollar Wallet`

            options = {
              headers: [{ name: 'User-Agent', value: userAgentString }, { name: 'Origin', value: publicUrl }],
            }
          }
          break
        default:
          break
      }

      return { provider, options }
    })

    return new MultipleHttpProvider(endpoints, config)
  }
}

export default SoftwareWalletProvider
