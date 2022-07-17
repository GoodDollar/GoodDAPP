// @flow
import Web3 from 'web3'
import AsyncStorage from '../../utils/asyncStorage'
import { GD_USER_PRIVATEKEYS } from '../../constants/localStorage'
import logger from '../../logger/js-logger'
import { THIRDPARTYWALLET_IDENTIFIERS } from '../../constants/login'
import type { WalletConfig } from '../WalletFactory'
import Config from '../../../config/config'
import MultipleAddressWallet from '../MultipleAddressWallet'
const log = logger.child({ from: 'ThirdPartyWalletProvider' })

const fuse = Config.ethereum[122]

export const chains = [
  {
    id: '0x7a',
    token: 'FUSE',
    label: 'Fuse Mainnet',
    rpcUrl: fuse.httpWeb3provider,
    publicRpcUrl: fuse.httpWeb3provider,
    blockExplorerUrl: fuse.explorer,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 74 74"><defs><linearGradient id="a" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#b1fdc0"/><stop offset="1" stop-color="#fefd86"/></linearGradient></defs><g transform="translate(-151 -208)"><g transform="translate(57 -154)"><circle cx="37" cy="37" r="37" transform="translate(94 362)" fill="url(#a)"/><path d="M1223.176,815.334a3.936,3.936,0,0,0-2.328-3.629l-4.305-1.963,4.31-1.948a3.981,3.981,0,0,0,.013-7.251l-12.538-5.716a16.977,16.977,0,0,0-14.036-.023l-12.557,5.675a3.981,3.981,0,0,0-.012,7.25l4.3,1.962-4.31,1.948a3.98,3.98,0,0,0-.012,7.25l4.3,1.963L1181.7,822.8a3.981,3.981,0,0,0-.011,7.25l12.538,5.717a16.978,16.978,0,0,0,14.036.023l12.555-5.675a3.981,3.981,0,0,0,.013-7.251l-4.3-1.962,4.311-1.948a3.936,3.936,0,0,0,2.341-3.62m-32.281,7.747,3.345,1.525a16.981,16.981,0,0,0,14.042.024l1.952-.882-4.993-2.275-.168.052a12.944,12.944,0,0,1-9.158-.6l-12.412-5.661,7.409-3.347,3.349,1.528a16.977,16.977,0,0,0,14.035.023l1.951-.883-4.992-2.275-.17.052a12.929,12.929,0,0,1-9.147-.595l-12.416-5.662,12.434-5.62a12.937,12.937,0,0,1,10.693.018l12.415,5.661-12.292,5.557,12.274,5.6-12.288,5.555,12.27,5.606-12.432,5.62a12.939,12.939,0,0,1-10.7-.018l-12.414-5.661Z" transform="translate(-1070.557 -416.498)" fill="#646464"/></g></g></svg>`,
  },
]

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
    web3.eth.defaultAccount =
      web3.eth.currentProvider.selectedAddress || web3.eth.currentProvider.accounts?.[0] || web3.eth.defaultAccount

    // https://github.com/ChainSafe/web3.js/issues/4780
    // use web3.eth.personal.sign as workaround for metamask
    const sign = web3.eth.personal.sign

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
