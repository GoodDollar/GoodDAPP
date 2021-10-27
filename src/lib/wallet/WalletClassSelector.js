import Config from '../../config/config'
import logger from '../../lib/logger/js-logger'

const { env } = Config

let walletModule = './GoodWalletClass'
if ('production' === env) {
  walletModule += 'Old'
}

const { GoodWallet } = require(walletModule)

logger.debug('WalletClassSelector:', { env, walletModule })
export { GoodWallet }
