// @flow
import Web3 from 'web3'
import AsyncStorage from '../utils/asyncStorage'
import { GD_USER_PRIVATEKEYS } from '../constants/localStorage'
import logger from '../logger/js-logger'
import { THIRDPARTYWALLET_IDENTIFIERS } from '../constants/login'
import type { WalletConfig } from './WalletFactory'
import MultipleAddressWallet from './MultipleAddressWallet'
import { isMetamaskProvider } from './utils'
const log = logger.child({ from: 'ThirdPartyWalletProvider' })

//TODO:
//3. login name screen shows "ok we verified your phone" why?>
//4. query explorer for first user tx for polling
//5. delay between initial mass polling
//6. fuse chain details should be dynamic
//7. already have an account loop/wrong button text
//8. already have an account with metamask for no reason?
//10. handle account switch
//11. handle unsupported chain switch
//12. save onboard session to reconnect

class ThirdPartyWalletProvider {
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
    this.ready = this.initWallet()
  }

  async initWallet(): Promise<Web3> {
    log.info('wallet config:', this.conf)

    let web3: Web3 = this.conf.web3
    let pkey: ?string
    web3.eth.defaultAccount = web3.eth.currentProvider.selectedAddress || web3.eth.currentProvider.accounts[0]

    // https://github.com/ChainSafe/web3.js/issues/4780
    // use web3.eth.personal.sign as workaround for metamask
    const sign = isMetamaskProvider(web3.currentProvider) ? web3.eth.personal.sign : web3.eth.sign

    let [publicKey, ...privateKeys] = (await AsyncStorage.getItem(GD_USER_PRIVATEKEYS)) || []

    //we start from addres 1, since from address 0 pubkey all public keys can  be generated
    //and we want privacy
    if (privateKeys == null || publicKey !== web3.eth.defaultAccount) {
      pkey = await sign(THIRDPARTYWALLET_IDENTIFIERS, web3.eth.defaultAccount).then(_ => _.slice(2, 66)) //32 bytes psuedo key
      let mulWallet = new MultipleAddressWallet(pkey, 10)

      privateKeys = mulWallet.wallets
      log.debug('Generating private keys from hdwallet', { privateKeys })

      AsyncStorage.safeSet(GD_USER_PRIVATEKEYS, [web3.eth.defaultAccount, ...privateKeys])
    } else {
      log.debug('Existing private keys found')
    }

    // assign(web3.eth, this.defaults)
    privateKeys.forEach(pkey => {
      let wallet = web3.eth.accounts.privateKeyToAccount(pkey)
      web3.eth.accounts.wallet.add(wallet)
    })

    return web3
  }
}

export default ThirdPartyWalletProvider
