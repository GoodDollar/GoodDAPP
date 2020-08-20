//@flow
import { pick } from 'lodash'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import isWebApp from './lib/utils/isWebApp'
import Analytics from './lib/analytics/analytics'
import { APP_OPEN } from './lib/constants/analytics'
import { setUserStorage, setWallet } from './lib/undux/SimpleStore'
import DeepLinking from './lib/utils/deepLinking'
import logger from './lib/logger/pino-logger'

const { initAnalytics, fireEvent } = Analytics

const log = logger.child({ from: 'init' })

let initialized = false

// userStorage.ready already awaits for goodwallet
export const init = () =>
  userStorage.ready.then(async () => {
    let source = 'none'
    log.debug('wallet and storage ready, initializing analytics', { initialized })

    if (initialized === false) {
      global.wallet = goodWallet

      // set wallet to simple storage so we can use it in InternetConnection
      setWallet(goodWallet)

      // set userStorage to simple storage
      setUserStorage(userStorage)

      await initAnalytics()
      log.debug('analytics has been initialized')

      const source =
        Object.keys(pick(DeepLinking.params, ['inviteCode', 'web3', 'paymentCode', 'code'])).pop() || 'none'

      fireEvent(APP_OPEN, { source, isWebApp })
      initialized = true
    }

    return { goodWallet, userStorage, source }
  })
