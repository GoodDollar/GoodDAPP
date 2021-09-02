import Config from '../../config/config'

// import { GoodWallet } from './GoodWalletClass'

let GoodWallet
if (['production'].includes(Config.env) === false) {
  GoodWallet = require('./GoodWalletClass').GoodWallet
} else {
  GoodWallet = require('./GoodWalletClassOld').GoodWallet
}
const wallet = new GoodWallet({
  web3Transport: Config.web3TransportProvider,
})
global.wallet = wallet
export { GoodWallet }
export default wallet
