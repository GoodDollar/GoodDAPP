//@flow
import goodWallet from '../wallet/GoodWallet'
import goodWalletLogin from '../login/GoodWalletLogin'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'checkAuthStatus' })

export const checkAuthStatus = async () => {
  // when wallet is ready perform login to server (sign message with wallet and send to server)
  const [credsOrError, isCitizen]: any = await Promise.all([goodWalletLogin.auth(), goodWallet.isCitizen()])

  const isAuthorized = credsOrError.jwt !== undefined
  const isLoggedIn = isAuthorized
  const isLoggedInCitizen = isLoggedIn && isCitizen
  log.debug('checkAuthStatus result:', { credsOrError, isCitizen })
  return {
    credsOrError,
    isLoggedInCitizen,
    isLoggedIn,
  }
}
