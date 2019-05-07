// @flow
import Web3 from 'web3'
import bip39 from 'bip39-light'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import type { WalletConfig } from './WalletFactory'
import type { HttpProvider } from 'web3-providers-http'
import MultipleAddressWallet from './MultipleAddressWallet'
import type { WebSocketProvider } from 'web3-providers-ws'

const log = logger.child({ from: 'SoftwareWalletProvider' })

const GD_USER_MNEMONIC: string = 'GD_USER_MNEMONIC'

export function saveMnemonics(mnemonics: string) {
  localStorage.setItem(GD_USER_MNEMONIC, mnemonics)
}

export function deleteMnemonics() {
  localStorage.removeItem(GD_USER_MNEMONIC)
}

export function getMnemonics(): string {
  let pkey = localStorage.getItem(GD_USER_MNEMONIC)
  if (!pkey) {
    pkey = generateMnemonic()
    saveMnemonics(pkey)
    log.info('item set in localStorage ', { pkey })
  } else {
    log.info('pkey found, creating account from pkey:', { pkey })
  }
  return pkey
}

function generateMnemonic(): string {
  let mnemonic = bip39.generateMnemonic()
  return mnemonic
}

class SoftwareWalletProvider {
  ready: Promise<Web3>
  GD_USER_PKEY: string = 'GD_USER_PKEY'

  conf: WalletConfig

  constructor(conf: WalletConfig) {
    this.conf = conf
    this.ready = this.initSoftwareWallet()
  }
  getPKey() {
    return localStorage.getItem(this.GD_USER_PKEY)
  }
  async init(): Promise<Web3> {
    let provider = this.getWeb3TransportProvider()
    log.info('wallet config:', this.conf, provider)

    let web3 = new Web3(provider)
    //let web3 = new Web3(new WebsocketProvider("wss://ropsten.infura.io/ws"))
    let pkey: ?string = localStorage.getItem(this.GD_USER_PKEY)
    let account
    if (!pkey) {
      account = await web3.eth.accounts.create()
      log.info('account Add is:', account.address)
      log.info('Private Key is:', account.privateKey)
      localStorage.setItem(this.GD_USER_PKEY, account.privateKey)
      pkey = localStorage.getItem(this.GD_USER_PKEY)
      log.info('item set in localStorage ', { pkey })
    } else {
      log.info('pkey found, creating account from pkey:', { pkey })
    }
    web3.eth.accounts.wallet.add(pkey)
    web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address

    return web3
  }

  async initSoftwareWallet(): Promise<Web3> {
    let provider = this.getWeb3TransportProvider()
    log.info('wallet config:', this.conf, provider)

    //let web3 = new Web3(new WebsocketProvider("wss://ropsten.infura.io/ws"))
    let pkey: ?string = getMnemonics()

    //we start from addres 1, since from address 0 pubkey all public keys can  be generated
    //and we want privacy
    let mulWallet = new MultipleAddressWallet(pkey, 10)
    let web3 = new Web3(provider)
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
      case 'WebSocket':
        provider = this.conf.websocketWeb3Provider
        web3Provider = new Web3.providers.WebsocketProvider(provider)
        break

      case 'HttpProvider':
        const infuraKey = this.conf.httpWeb3provider.indexOf('infura') !== -1 ? Config.infuraKey : ''
        provider = this.conf.httpWeb3provider + infuraKey
        web3Provider = new Web3.providers.HttpProvider(provider)
        break

      default:
        provider = this.conf.httpWeb3provider + Config.infuraKey
        web3Provider = new Web3.providers.HttpProvider(provider)
        break
    }

    return web3Provider
  }
}

export default SoftwareWalletProvider
