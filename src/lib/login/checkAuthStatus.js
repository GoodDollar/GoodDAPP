//@flow
import goodWallet from '../wallet/GoodWallet'
import goodWalletLogin from '../login/GoodWalletLogin'
import GDStore from '../undux/GDStore'
import userStorage from '../gundb/UserStorage'

export const checkAuthStatus = async (store: GDStore) => {
  // when wallet is ready perform login to server (sign message with wallet and send to server)
  const [credsOrError, isCitizen]: any = await Promise.all([goodWalletLogin.auth(), goodWallet.isCitizen()])

  const isLoggedIn = credsOrError.jwt !== undefined && (await userStorage.getProfileField('registered'))
  const isLoggedInCitizen = isLoggedIn && isCitizen

  store.set('isLoggedIn')(isLoggedIn)
  store.set('isLoggedInCitizen')(isLoggedInCitizen)
  return {
    credsOrError,
    isLoggedInCitizen,
    isLoggedIn
  }
}
