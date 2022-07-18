// @flow
import { useCallback, useEffect, useState } from 'react'
import LoginService from '../api/LoginFlowService'

import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'useLoginFlow' })

const useLoginFlow = (signature, nonce, fvsig) => {
  const [jwt, setJWT] = useState()
  const [error, setError] = useState()

  const doLogin = useCallback(async () => {
    const login = new LoginService(signature, nonce, fvsig)

    try {
      const { jwt } = await login.auth(true)

      setJWT(jwt)
    } catch (exception) {
      const { message } = exception

      log.error('failed fvauth:', message, exception)
      setError(message)
    }

    setJWT(jwt)
  }, [setError, setJWT])

  useEffect(() => {
    log.info('useFVFlow mount:', { signature, nonce, fvsig })

    if (signature && nonce && fvsig) {
      doLogin()
      return
    }

    if (!signature) {
      setError('Missing address for verification details')
    }
  }, [signature, nonce, fvsig, doLogin])

  return { jwt, error }
}

export default useLoginFlow
