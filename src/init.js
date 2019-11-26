//@flow
import _pick from 'lodash/pick'
import './lib/gundb/gundb'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import isWebApp from './lib/utils/isWebApp'
import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'
import { extractQueryParams } from './lib/share'
import { setUserStorage, setWallet } from './lib/undux/SimpleStore'

export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(async () => {
    global.wallet = goodWallet
    setWallet(goodWallet)
    setUserStorage(userStorage)
    await initAnalytics(goodWallet, userStorage)

    const params = extractQueryParams(window.location.href)
    const source = Object.keys(_pick(params, ['web3', 'paymentCode', 'code'])).pop() || 'none'

    fireEvent(APP_OPEN, { source, isWebApp })

    return { goodWallet, userStorage, source }
  })
}
