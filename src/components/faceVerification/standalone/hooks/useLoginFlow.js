// @flow
import React, { createContext, useEffect, useRef, useState } from 'react'
import type { Credentials } from '../../../../lib/API/api'
import logger from '../../../../lib/logger/js-logger'
import API, { getErrorMessage } from '../../../../lib/API/api'
import DeepLinking from '../utils/deepLinking'
import LoginService from '../../../../lib/login/LoginService'
import Config from '../../../../config/config'

const log = logger.child({ from: 'useLoginFlow' })

const useLoginFlow = (signature, nonce, fvsig) => {
  const [jwt, setJWT] = useState()
  const [error, setError] = useState()

  const doLogin = async () => {
    const fvLogin = new FVFlow(signature, nonce, fvsig)
    const { jwt } = await fvLogin.auth(true).catch(e => {
      log.error('failed fvauth:', e.message, e)

      setError(e.message)
    })

    setJWT(jwt)
  }

  useEffect(() => {
    log.info('useFVFlow mount:', { signature, nonce, fvsig })
    if (signature && nonce && fvsig) {
      doLogin()
    } else if (!signature) {
      setError('Missing address for verification details')
    }
  }, [signature, nonce, fvsig])

  return { jwt, error }
}


export default useLoginFlow
