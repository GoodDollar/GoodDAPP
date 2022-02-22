//@flow
import goodWallet from '../wallet/GoodWallet'
import logger from '../../lib/logger/js-logger'
import goodWalletLogin from './GoodWalletLogin'

const log = logger.child({ from: 'checkAuthStatus' })

const signInAttempt = async (withRefresh = false) => {
  const creds = await goodWalletLogin.auth(withRefresh)
  const { decoded } = await goodWalletLogin.validateJWTExistenceAndExpiration()

  log.info('jwtsignin: jwt data', { creds, decoded })

  if (!decoded || decoded.aud === 'unsigned') {
    const exception = new Error('jwt is of unsigned user')

    exception.name = 'UnsignedJWTError'
    throw exception
  }

  return creds
}

const jwtSignin = async () => {
  try {
    const creds = await signInAttempt()

    return creds
  } catch (exception) {
    if ('OutdatedProfileSignatureError' === exception.name) {
      throw exception
    }
  }

  log.warn('jwt login failed or missing aud in jwt, trying to refresh token')
  return signInAttempt(true)
}

export const checkAuthStatus = async () => {
  // when wallet is ready perform login to server (sign message with wallet and send to server)
  const [creds, isCitizen]: any = await Promise.all([jwtSignin(), goodWallet.isCitizen()])
  const isAuthorized = creds.jwt !== undefined
  const isLoggedIn = isAuthorized
  const isLoggedInCitizen = isLoggedIn && isCitizen

  log.debug('checkAuthStatus result:', { creds, isCitizen })

  return [isLoggedInCitizen, isLoggedIn]
}
