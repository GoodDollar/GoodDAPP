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

const log = logger.child({ from: 'SoftwareWalletProvider' })
const { WebsocketProvider, HttpProvider } = Web3.providers

// const send = HttpProvider.prototype.send
// HttpProvider.prototype.send = function(payload, callback) {
//   const _this = this
//   const newcb = (error, result) => {
//     console.log('newcb', { payload, error, _this })
//     return callback(error, result)
//   }
//   return send(payload, newcb)
// }

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
    const { httpWeb3provider } = this.conf
    const backend = ['infura', 'pokt'].find(server => httpWeb3provider.includes(server))

    let provider = httpWeb3provider
    let options = {}

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

    const p = new HttpProvider(provider, options)
    const send = p.send.bind(p)
    p.send = function(payload, callback) {
      const newcb = (error, result) => {
        // console.log('newcb', { payload, error, provider, _this })
        if (error?.message?.search('CONNECTION ERROR|CONNECTION TIMEOUT|Invalid JSON RPC') >= 0) {
          this.host = 'https://rpc.fuse.io'
          return send(payload, callback)
        }
        return callback(error, result)
      }
      return send(payload, newcb)
    }
    return p
  }
}

export default SoftwareWalletProvider
