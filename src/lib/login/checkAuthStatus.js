//@flow
import { useCallback, useContext, useEffect, useState } from 'react'
import { GoodWalletContext } from '../wallet/GoodWalletProvider'
import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'checkAuthStatus' })

const signInAttempt = async (withRefresh = false, login) => {
  const walletLogin = await login(withRefresh)
  const { decoded, jwt } = await walletLogin.validateJWTExistenceAndExpiration()
  log.info('jwtsignin: jwt data', { decoded, jwt })

  if (!decoded || decoded.aud === 'unsigned') {
    const exception = new Error('jwt is of unsigned user')

    exception.name = 'UnsignedJWTError'
    throw exception
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
    const jwt = await jwtSignin(login).catch(e => log.error('JWT sign in failed', e, e.message))
    const isLoggedIn = jwt !== undefined
    const isLoggedInCitizen = isLoggedIn && isCitizen

    log.debug('checkAuthStatus result:', { jwt, isCitizen, isLoggedInCitizen, isLoggedIn })
    setAuthStatus([isLoggedInCitizen, isLoggedIn])
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
