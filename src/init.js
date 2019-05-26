//@flow
import initGunDB from './lib/gundb/gundb'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'

declare var Rollbar
declare var amplitude
export const init = async () => {
  return await Promise.all([goodWallet.ready, userStorage.ready]).then(([wallet, storage]) => {
    global.wallet = goodWallet
    Rollbar.configure({
      payload: {
        person: {
          id: goodWallet.getAccountForType('login')
        }
      }
    })
    amplitude.getInstance().setUserId(goodWallet.getAccountForType('login'))
  })
}
