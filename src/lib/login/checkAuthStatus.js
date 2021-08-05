//@flow
import goodWallet from '../wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import goodWalletLogin from './GoodWalletLogin'

const log = logger.child({ from: 'checkAuthStatus' })

export const checkAuthStatus = async () => {
  // when wallet is ready perform login to server (sign message with wallet and send to server)
  const [credsOrError, isCitizen]: any = await Promise.all([goodWalletLogin.auth(true), goodWallet.isCitizen()])

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
