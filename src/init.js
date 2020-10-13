//@flow
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'
import { setUserStorage, setWallet } from './lib/undux/SimpleStore'
import logger from './lib/logger/pino-logger'

const log = logger.child({ from: 'init' })

let initialized = false

// userStorage.ready already awaits for goodwallet
export const init = async () => {
  await userStorage.ready
  log.debug('wallet and storage ready, initializing analytics', { initialized })

  if (initialized === false) {
    global.wallet = goodWallet

    // set wallet to simple storage so we can use it in InternetConnection
    setWallet(goodWallet)

    // set userStorage to simple storage
    setUserStorage(userStorage)

    initialized = true
  }

  return { goodWallet, userStorage }
}
