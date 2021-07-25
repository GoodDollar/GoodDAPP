import Config from '../../config/config'

// import { GoodWallet } from './GoodWalletClass'

export let GoodWallet
if (['staging', 'production'].includes(Config.env) === false) {
  GoodWallet = require('./GoodWalletClass').GoodWallet
} else {
  GoodWallet = require('./GoodWalletClassOld').GoodWallet
}
const wallet = new GoodWallet({
  web3Transport: Config.web3TransportProvider,
})
global.wallet = wallet
export default wallet
