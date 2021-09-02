// @flow
import HDKey from 'hdkey'
import bip39 from 'bip39-light'
import conf from '../../config/config'
import logger from '../logger/pino-logger'

class MultipleAddressWallet {
  ready: Promise<Web3>

  mnemonic: string

  seed: string

  wallets: Array<string>

  numOfAccounts: number = 10

  constructor(mnemonic: string, numOfAccounts: number) {
    logger.debug('MultipleAddressWallet ', { mnemonic }, { numOfAccounts })
    this.numOfAccounts = numOfAccounts

    //for torus login we use the private key as seed not a mnemonic phrase
    if (conf.torusEnabled === false) {
      this.seed = bip39.mnemonicToSeed(mnemonic)
    } else {
      this.seed = mnemonic
    }
    this.mnemonic = mnemonic
    this.wallets = []
    this.initAccounts()
  }

  initAccounts() {
    // i starts from 1
    let root = HDKey.fromMasterSeed(this.seed)
    for (let i = 0; i < this.numOfAccounts; i++) {
      var path = "m/44'/60'/0'/0/" + (i + 1)
      let addrNode = root.derive(path)
      let privateKeyBuffer = Buffer.from(addrNode._privateKey, 'hex')
      this.wallets.push('0x' + privateKeyBuffer.toString('hex'))
    }
  }
}

export default MultipleAddressWallet
