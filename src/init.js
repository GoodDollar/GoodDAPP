import initGunDB from './lib/gundb/gundb'
import GoodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'

export const init = async () => {
  return await Promise.all([GoodWallet.ready, userStorage.ready]).then(([wallet, storage]) => {
    global.wallet = GoodWallet
  })
}
