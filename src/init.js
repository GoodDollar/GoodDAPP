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
    const emailOrId = (await userStorage.getProfileFieldValue('email')) || identifier
    if (global.Rollbar && Config.env !== 'test') {
      global.Rollbar.configure({
        payload: {
          person: {
            id: emailOrId
          }
        }
      })
    }
    global.FS && FS.identify(emailOrId, {})
    global.amplitude && amplitude.getInstance().setUserId(emailOrId)
  })
}
