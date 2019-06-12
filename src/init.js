//@flow
// eslint-disable-next-line no-unused-vars
import initGunDB from './lib/gundb/gundb'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import Config from './config/config'
declare var amplitude
export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(() => {
    global.wallet = goodWallet
    if (global.Rollbar && Config.env !== 'test') {
      global.Rollbar.configure({
        payload: {
          person: {
            id: goodWallet.getAccountForType('login')
          }
        }
      })
    }
    amplitude.getInstance().setUserId(goodWallet.getAccountForType('login'))
  })
}
