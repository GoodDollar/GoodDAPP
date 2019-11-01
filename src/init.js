//@flow
import './lib/gundb/gundb'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import logger from './lib/logger/pino-logger'

import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'
import { extractQueryParams } from './lib/share'

export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(async () => {
    global.wallet = goodWallet
    await initAnalytics(goodWallet, userStorage, logger)

    if (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true
    ) {
      const params = extractQueryParams(window.location.href)
      if (params.web3 || params.paymentCode) {
        fireEvent(APP_OPEN, { source: params.paymentCode ? 'payment code' : 'w3' })
      }
    }

    return { goodWallet, userStorage }
  })
}
