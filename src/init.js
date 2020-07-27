//@flow
import { pick } from 'lodash'
import { Platform } from 'react-native'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import isWebApp from './lib/utils/isWebApp'
import { APP_OPEN, fireEvent, identifyWithSignedInUser, initAnalytics } from './lib/analytics/analytics'
import { extractQueryParams } from './lib/share'
import { setUserStorage, setWallet } from './lib/undux/SimpleStore'
import logger from './lib/logger/pino-logger'

const log = logger.child({ from: 'init' })

let initialized = false

export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(async () => {
    log.debug('wallet and storage ready, initializing analytics', { initialized })
    let source = 'none'
    if (initialized === false) {
      global.wallet = goodWallet

      // set wallet to simple storage so we can use it in InternetConnection
      setWallet(goodWallet)

      // set userStorage to simple storage
      setUserStorage(userStorage)

      await initAnalytics()
      log.debug('analytics has been initialized')
      await identifyWithSignedInUser(goodWallet, userStorage)
      log.debug('analytics has been identified with the user signed in')
      fireEvent(APP_OPEN, { source, isWebApp })

      // FIXME RN INAPPLINKS
      if (Platform.OS === 'web') {
        const params = extractQueryParams(window.location.href)

        source = document.referrer.match(/^https:\/\/(www\.)?gooddollar\.org/) == null ? source : 'web3'
        source = Object.keys(pick(params, ['inviteCode', 'web3Token', 'paymentCode', 'code'])).pop() || source
      }

      initialized = true
    }

    return { goodWallet, userStorage, source }
  })
}
