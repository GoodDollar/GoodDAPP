//@flow
import goodWallet from '../wallet/GoodWallet'
import logger from '../../lib/logger/js-logger'
import goodWalletLogin from './GoodWalletLogin'

const log = logger.child({ from: 'checkAuthStatus' })

const jwtSignin = async () => {
  const credsOrFailed = await goodWalletLogin.auth().catch(e => false)
  let { decoded } = await goodWalletLogin.validateJWTExistenceAndExpiration()
  log.info('jwtsignin: jwt data', { decoded })
  if (credsOrFailed === false || decoded.aud === 'unsigned') {
    log.warn('jwt login failed or missing aud in jwt, trying to refresh token', { credsOrFailed, decoded })
    await goodWalletLogin.auth(true)
    let { decoded: decoded2 } = await goodWalletLogin.validateJWTExistenceAndExpiration()
    if (!decoded2 || decoded2.aud === 'unsigned') {
      throw new Error('jwt is of unsigned user')
    }
  }
  return credsOrFailed
}
export const checkAuthStatus = async () => {
  // when wallet is ready perform login to server (sign message with wallet and send to server)
  const [credsOrError, isCitizen]: any = await Promise.all([jwtSignin(), goodWallet.isCitizen()])

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
