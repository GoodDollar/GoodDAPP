//@flow
import { useCallback, useContext, useEffect, useState } from 'react'
import { GoodWalletContext } from '../wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'
import { throwExceptionWithCode } from '../exceptions/utils'

const log = logger.child({ from: 'checkAuthStatus' })

const signInAttempt = async (withRefresh = false, login) => {
  const walletLogin = await login(withRefresh)
  const { decoded, jwt } = await walletLogin.validateJWTExistenceAndExpiration()
  const { aud } = decoded || {}

  log.info('jwtsignin: jwt data', { decoded, jwt, aud })

  if (!decoded || aud === 'unsigned') {
    throwExceptionWithCode('jwt is of unsigned user', 'UnsignedJWTError')
  } else if (!aud) {
    throwExceptionWithCode('jwt have the old format, missing aud', 'OldFormatJWTError')
  }

  return jwt
}

const jwtSignin = async login => {
  try {
    const jwt = await signInAttempt(false, login)

    return jwt
  } catch (exception) {
    if ('OutdatedProfileSignatureError' === exception.name) {
      throw exception
    }
  }

  log.warn('jwt login failed or missing aud in jwt, trying to refresh token')
  return signInAttempt(true, login)
}

export const useCheckAuthStatus = () => {
  const { login, goodWallet, isCitizen } = useContext(GoodWalletContext)
  const [authStatus, setAuthStatus] = useState([])

  const check = useCallback(async () => {
    try {
      const jwt = await jwtSignin(login)
      const isLoggedIn = jwt !== undefined
      const isLoggedInCitizen = isLoggedIn && isCitizen

      log.debug('checkAuthStatus result:', { jwt, isCitizen, isLoggedInCitizen, isLoggedIn })
      setAuthStatus([isLoggedInCitizen, isLoggedIn])
    } catch (exception) {
      const { message } = exception

      log.error('JWT sign in failed', message, exception)
    }
  }, [login, goodWallet, isCitizen])

  useEffect(() => {
    // when wallet is ready perform login to server (sign message with wallet and send to server)

    if (goodWallet && login) {
      log.debug('on wallet')
      check()
    }
  }, [goodWallet, login, check])

  return { authStatus, refresh: check }
}
