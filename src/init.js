//@flow
// eslint-disable-next-line no-unused-vars
import initGunDB from './lib/gundb/gundb'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import Config from './config/config'
declare var amplitude

declare var __insp
declare var FS
export const init = () => {
  return Promise.all([goodWallet.ready, userStorage.ready]).then(async ([wallet, storage]) => {
    global.wallet = goodWallet
    const identifier = goodWallet.getAccountForType('login')
    const email = (await userStorage.getProfileFieldValue('email')) || ''
    if (global.Rollbar && Config.env !== 'test') {
      global.Rollbar.configure({
        payload: {
          person: {
            id: identifier
          }
        }
      })
    }
    window.FS &&
      FS.identify(identifier, {
        email
      })
    amplitude.getInstance().setUserId(identifier)
  })
}
