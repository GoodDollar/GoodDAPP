//@flow
// eslint-disable-next-line no-unused-vars
import initGunDB from './lib/gundb/gundb'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import Config from './config/config'
declare var amplitude

declare var __insp
export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(([wallet, storage]) => {
    global.wallet = goodWallet
    const identifier = goodWallet.getAccountForType('login')
    if (global.Rollbar && Config.env !== 'test') {
      global.Rollbar.configure({
        payload: {
          person: {
            id: identifier
          }
        }
      })
    }
    amplitude.getInstance().setUserId(identifier)
    __insp.push(['identify', identifier])
  })
}
