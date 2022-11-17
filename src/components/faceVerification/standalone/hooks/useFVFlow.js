// @flow
import { useEffect, useState } from 'react'
import LoginService from '../api/FVFlowService'

import { identifyWith } from '../../../../lib/analytics/analytics'
import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'useFVFlow' })

const useFVFlow = (signature, nonce, fvsig, account) => {
  const [jwt, setJWT] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    const onSuccess = ({ jwt }) => {
      setJWT(jwt)
      identifyWith(account)
    }

    const onError = exception => {
      const { message } = exception

      log.error('failed fvauth:', message, exception)
      setError(message)
    }

    log.info('useFVFlow mount:', { signature, nonce, fvsig, account })

    if (!fvsig || !account) {
      const exception = new Error('Missing address for verification details')

      onError(exception)
      return
    }

    const login = new LoginService(signature, nonce, fvsig, account)

    login
      .auth(true)
      .then(onSuccess)
      .catch(onError)
  }, [signature, nonce, fvsig, account, setError, setJWT])

  return { jwt, error }
}

export default useFVFlow
