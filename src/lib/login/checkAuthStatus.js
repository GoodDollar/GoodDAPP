//@flow
import goodWallet from '../wallet/GoodWallet'
import goodWalletLogin from '../login/GoodWalletLogin'

import logger from '../logger/pino-logger'
import API from '../API/api'
import GDStore from '../undux/GDStore'

const log = logger.child({ from: 'AppSwitch' })

export const checkAuthStatus = async (store: GDStore) => {
  // when wallet is ready perform login to server (sign message with wallet and send to server)
  // debugger
  const [credsOrError, isCitizen]: any = await Promise.all([goodWalletLogin.auth(), goodWallet.isCitizen()])

  const isLoggedIn = credsOrError.jwt !== undefined
  const isLoggedInCitizen = isLoggedIn && isCitizen

  store.set('isLoggedInCitizen')(isLoggedInCitizen)
  return {
    credsOrError,
    isLoggedInCitizen
  }
}
