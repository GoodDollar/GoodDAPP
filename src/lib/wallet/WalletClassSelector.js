import Config from '../../config/config'

let GoodWallet
if (['production'].includes(Config.env) === false) {
  GoodWallet = require('./GoodWalletClass').GoodWallet
} else {
  GoodWallet = require('./GoodWalletClassOld').GoodWallet
}
export { GoodWallet }
