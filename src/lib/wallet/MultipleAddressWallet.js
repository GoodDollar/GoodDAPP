// @flow
import HDKey from 'hdkey'
import Wallet from 'ethereumjs-wallet'
import logger from '../logger/pino-logger'

type WalletsCollection = {
  [key: string]: Wallet // Associative array
}
class MultipleAddressWallet {
  ready: Promise<Web3>
  wallet: Wallet
  wallets: WalletsCollection
  mnemonic: string
  addresses: Array<string>
  numOfAccounts: number = 10

  constructor(mnemonic: string, numOfAccounts: number) {
    logger.debug('MultipleAddressWallet ', { mnemonic }, { numOfAccounts })
    this.numOfAccounts = numOfAccounts
    this.mnemonic = mnemonic
    this.addresses = []
    this.wallets = {}
    this.initAccounts()
    this.wallet = this.wallets[this.addresses[0]]
  }

  initAccounts() {
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
      this.wallets[address] = wallet
    }
  }
}

export default MultipleAddressWallet
