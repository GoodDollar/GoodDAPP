//@flow
// eslint-disable-next-line no-unused-vars
import initGunDB from './lib/gundb/gundb'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import { initAnalytics } from './lib/analytics/analytics'

export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(async () => {
    global.wallet = goodWallet
    await initAnalytics(goodWallet, userStorage)
    return { goodWallet, userStorage }
  })
}
