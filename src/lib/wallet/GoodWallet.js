import Config from '../../config/config'

// import { GoodWallet } from './GoodWalletClass'

let GoodWallet
if (Config.env === 'development') {
  GoodWallet = require('./GoodWalletClass').GoodWallet
} else {
  GoodWallet = require('./GoodWalletClassOld').GoodWallet
}
const wallet = new GoodWallet({
  web3Transport: Config.web3TransportProvider,
})
global.wallet = wallet
export default wallet
