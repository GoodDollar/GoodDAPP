// @flow
import { useCallback, useEffect, useState } from 'react'
import LoginService from '../api/LoginFlowService'

import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'useLoginFlow' })

const useLoginFlow = (signature, nonce, fvsig) => {
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

      login.auth(true).then(({ jwt }) => setJWT(jwt)).catch(onError)
      return
    }

    if (!signature) {
      const exception = new Error('Missing address for verification details')

      onError(exception)
    }
  }, [signature, nonce, fvsig, doLogin, setError, setJWT])

  return { jwt, error }
}

export default useLoginFlow
