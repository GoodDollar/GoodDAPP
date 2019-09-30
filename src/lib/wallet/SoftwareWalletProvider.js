// @flow
import Web3 from 'web3'
import bip39 from 'bip39-light'
import type { HttpProvider, WebSocketProvider } from 'web3-providers'
import { AsyncStorage } from 'react-native'
import Config from '../../config/config'
import { GD_USER_MNEMONIC } from '../constants/localStorage'
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
  let pkey = await AsyncStorage.getItem(GD_USER_MNEMONIC)

  if (pkey) {
    log.info('pkey found, creating account from pkey:', { pkey })
  } else {
    pkey = generateMnemonic()
    saveMnemonics(pkey)
    log.info('item set in localStorage ', { pkey })
  }

  return pkey
}

export async function getMnemonicsObject(): Promise<any> {
  const pkey = await getMnemonics()
  return { ...pkey.split(' ') }
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
    defaultGas: 140000,
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

    //we start from addres 1, since from address 0 pubkey all public keys can  be generated
    //and we want privacy
    let mulWallet = new MultipleAddressWallet(pkey, 10)
    let web3 = new Web3(provider, null, this.defaults)
    mulWallet.addresses.forEach(addr => {
      let wallet = web3.eth.accounts.privateKeyToAccount('0x' + mulWallet.wallets[addr].getPrivateKey().toString('hex'))
      web3.eth.accounts.wallet.add(wallet)
    })
    let accounts = mulWallet.addresses
    web3.eth.defaultAccount = accounts[0]
    return web3
  }

  getWeb3TransportProvider(): HttpProvider | WebSocketProvider {
    let provider
    let web3Provider
    let transport = this.conf.web3Transport
    switch (transport) {
      case 'WebSocketProvider':
        provider = this.conf.websocketWeb3Provider
        web3Provider = new Web3.providers.WebsocketProvider(provider)
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
