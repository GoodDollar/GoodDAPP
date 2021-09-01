//@flow
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/userStorage/UserStorage'
import { setUserStorage, setWallet } from './lib/undux/SimpleStore'
import logger from './lib/logger/js-logger'

const log = logger.get('init')

let initialized = false

// userStorage.ready already awaits for goodwallet
export const init = async () => {
  await userStorage.ready
  log.debug('wallet and storage ready, initializing analytics', { initialized })

  if (initialized === false) {
    // set wallet to simple storage so we can use it in InternetConnection
    setWallet(goodWallet)

    // set userStorage to simple storage
    setUserStorage(userStorage)

    initialized = true
  }

  return { goodWallet, userStorage }
}
