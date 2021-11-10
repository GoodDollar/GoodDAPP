import Config from '../../config/config'
import logger from '../../lib/logger/js-logger'

const { env } = Config
const log = logger.child({ from: 'WalletClassSelector' })
const logSelected = className => log.debug('Selected wallet class for env', { [env]: className })

const { GoodWallet } = (() => {
  switch (env) {
    case 'production':
      logSelected('GoodWalletClassOld')
      return require('./GoodWalletClassOld')
    default:
      logSelected('GoodWalletClass')
      return require('./GoodWalletClass')
  }
})()

export { GoodWallet }
