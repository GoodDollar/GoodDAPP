//@flow
import { pick } from 'lodash'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import isWebApp from './lib/utils/isWebApp'
import { APP_OPEN, fireEvent, initAnalytics } from './lib/analytics/analytics'
import { setUserStorage, setWallet } from './lib/undux/SimpleStore'
import Linking from './lib/utils/linking'

export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(async () => {
    global.wallet = goodWallet

    // set wallet to simple storage so we can use it in InternetConnection
    setWallet(goodWallet)

    // set userStorage to simple storage
    setUserStorage(userStorage)
    await initAnalytics(goodWallet, userStorage)

    const source = Object.keys(pick(Linking.params, ['web3', 'paymentCode', 'code'])).pop() || 'none'

    fireEvent(APP_OPEN, { source, isWebApp })

    return { goodWallet, userStorage, source }
  })
}
