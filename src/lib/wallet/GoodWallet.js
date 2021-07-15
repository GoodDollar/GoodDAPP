import Config from '../../config/config'

// import { GoodWallet } from './GoodWalletClass'

let GoodWallet
if (Config.env === 'development') {
  GoodWallet = require('./GoodWalletClassOld').GoodWallet
} else {
  GoodWallet = require('./GoodWalletClassOld').GoodWallet
}
export default new GoodWallet({
  web3Transport: Config.web3TransportProvider,
})
