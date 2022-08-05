// @flow
import { useEffect, useState } from 'react'
import LoginService from '../api/FVFlowService'

import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'useFVFlow' })

const useFVFlow = (signature, nonce, fvsig) => {
  const [jwt, setJWT] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    const onError = exception => {
      const { message } = exception

      log.error('failed fvauth:', message, exception)
      setError(message)
    }

    log.info('useFVFlow mount:', { signature, nonce, fvsig })

    if (signature && nonce && fvsig) {
      const login = new LoginService(signature, nonce, fvsig)

      login
        .auth(true)
        .then(({ jwt }) => setJWT(jwt))
        .catch(onError)

      return
    }

    if (!signature) {
      const exception = new Error('Missing address for verification details')

      onError(exception)
    }
  }, [signature, nonce, fvsig, setError, setJWT])

  return { jwt, error }
}

export default useFVFlow
