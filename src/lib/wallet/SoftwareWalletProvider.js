// @flow
import Web3 from 'web3'
import bip39 from 'bip39-light'
import type { HttpProvider, WebSocketProvider } from 'web3-providers'
import { assign } from 'lodash'
import AsyncStorage from '../utils/asyncStorage'
import Config from '../../config/config'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC, GD_USER_PRIVATEKEYS } from '../constants/localStorage'
import logger from '../logger/pino-logger'
import type { WalletConfig } from './WalletFactory'
import MultipleAddressWallet from './MultipleAddressWallet'

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

    // defaultGas: 140000,
    defaultGasPrice: 1000000,
    transactionBlockTimeout: 2,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 30,
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
      log.debug('Generating private keys from hdwallet')
      let mulWallet = new MultipleAddressWallet(pkey, 10)
      privateKeys = mulWallet.addresses.map(addr => '0x' + mulWallet.wallets[addr].getPrivateKey().toString('hex'))
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
    let provider
    let web3Provider
    let transport = this.conf.web3Transport
    switch (transport) {
      case 'WebSocketProvider':
        provider = this.conf.websocketWeb3Provider
        web3Provider = new Web3.providers.WebsocketProvider(provider, { timeout: 10000, reconnectDelay: 2000 })
        break

      case 'HttpProvider': {
        const infuraKey = this.conf.httpWeb3provider.indexOf('infura') === -1 ? '' : Config.infuraKey
        provider = this.conf.httpWeb3provider + infuraKey
        web3Provider = new Web3.providers.HttpProvider(provider)
        break
      }
      default:
        provider = this.conf.httpWeb3provider + Config.infuraKey
        web3Provider = new Web3.providers.HttpProvider(provider)
        break
    }

    return web3Provider
  }
}

export default SoftwareWalletProvider
