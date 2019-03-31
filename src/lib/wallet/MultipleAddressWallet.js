// @flow
import Web3 from 'web3'
import bip39 from 'bip39'
import HDKey from 'hdkey'
import EthUtil from 'ethereumjs-util'
import Wallet from 'ethereumjs-wallet'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import type { WalletConfig } from './WalletFactory'
import type { HttpProvider } from 'web3-providers-http'
import type { WebSocketProvider } from 'web3-providers-ws'

const log = logger.child({ from: 'MultipleAddressWallet' })

type walletsCollection = {
  [key: string]: Wallet // Associative array
}
class MultipleAddressWallet {
  ready: Promise<Web3>
  wallet: Wallet
  wallets: walletsCollection
  mnemonic: string
  addresses: Array<string>
  numOfAccounts: number = 10

  constructor(mnemonic: string, numOfAccounts: number) {
    logger.debug('MultipleAddressWallet ', { mnemonic }, { numOfAccounts })
    this.numOfAccounts = numOfAccounts
    this.mnemonic = mnemonic
    this.addresses = []
    this.wallets = {}
  }

  async ready() {
    await this.initAccounts()
    this.wallet = this.wallets[0]
  }

  async initAccounts() {
    // i starts from 1
    for (let i = 0; i < this.numOfAccounts; i++) {
      let root = HDKey.fromMasterSeed(this.mnemonic)
      var path = "m/44'/60'/0'/0/" + (i + 1)
      let addrNode = root.derive(path)
      let privateKeyBuffer = Buffer.from(addrNode._privateKey, 'hex')
      let wallet = Wallet.fromPrivateKey(privateKeyBuffer)
      let address = wallet.getAddressString()
      this.addresses.push(address)
      let wallets = this.wallets
      logger.debug({ wallets })
      this.wallets[address] = wallet
      logger.debug('added wallet,', { wallet })
    }
  }
}

export default MultipleAddressWallet
