//@flow
import './lib/gundb/gundb'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import logger from './lib/logger/pino-logger'

import { initAnalytics } from './lib/analytics/analytics'

export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(async () => {
    global.wallet = goodWallet
    await initAnalytics(goodWallet, userStorage, logger)
    return { goodWallet, userStorage }
  })
}
