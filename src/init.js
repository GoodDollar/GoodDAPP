//@flow
import _pick from 'lodash/pick'
import { Platform } from 'react-native'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import isWebApp from './lib/utils/isWebApp'
import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'
import { extractQueryParams } from './lib/share'
import { setUserStorage, setWallet } from './lib/undux/SimpleStore'

export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(async () => {
    global.wallet = goodWallet

    // set wallet to simple storage so we can use it in InternetConnection
    setWallet(goodWallet)

    // set userStorage to simple storage
    setUserStorage(userStorage)
    await initAnalytics(goodWallet, userStorage)

    let source = 'none'

    // FIXME RN INAPPLINKS
    if (Platform.OS === 'web') {
      const params = extractQueryParams(window.location.href)
      source = Object.keys(_pick(params, ['web3', 'paymentCode', 'code'])).pop() || source
    }

    fireEvent(APP_OPEN, { source, isWebApp })

    return { goodWallet, userStorage, source }
  })
}
