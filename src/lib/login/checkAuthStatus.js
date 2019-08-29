//@flow
import goodWallet from '../wallet/GoodWallet'
import goodWalletLogin from '../login/GoodWalletLogin'
import userStorage from '../gundb/UserStorage'

export const checkAuthStatus = async () => {
  // when wallet is ready perform login to server (sign message with wallet and send to server)
  const [credsOrError, isCitizen]: any = await Promise.all([goodWalletLogin.auth(), goodWallet.isCitizen()])

  const isAuthorized = credsOrError.jwt !== undefined
  const isRegistered = (await userStorage.getProfileFieldValue('registered')) !== undefined
  const isLoggedIn = isAuthorized && isRegistered
  const isLoggedInCitizen = isLoggedIn && isCitizen

  return {
    credsOrError,
    isLoggedInCitizen,
    isLoggedIn,
  }
}
