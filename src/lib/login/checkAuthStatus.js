//@flow
import goodWallet from '../wallet/GoodWallet'
import goodWalletLogin from '../login/GoodWalletLogin'

export const checkAuthStatus = async () => {
  // when wallet is ready perform login to server (sign message with wallet and send to server)
  const [credsOrError, isCitizen]: any = await Promise.all([goodWalletLogin.auth(), goodWallet.isCitizen()])

  const isAuthorized = credsOrError.jwt !== undefined
  const isLoggedIn = isAuthorized
  const isLoggedInCitizen = isLoggedIn && isCitizen

  return {
    credsOrError,
    isLoggedInCitizen,
    isLoggedIn,
  }
}
