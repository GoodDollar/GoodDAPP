// @flow
import React, { createContext, useEffect, useRef, useState } from 'react'
import type { Credentials } from '../API/api'
import logger from '../logger/js-logger'
import API, { getErrorMessage } from '../API/api'
import DeepLinking from '../utils/deepLinking'
import LoginService from '../login/LoginService'
import Config from '../../config/config'

const log = logger.child({ from: 'FVFlow' })

export const FVFlowContext = createContext({})

class FVFlow extends LoginService {
  constructor(signature, nonce, fvsig) {
    super()

    this.signature = signature
    this.nonce = nonce
    this.fvsig = fvsig
  }

  login(): Promise<Credentials> {
    const creds = {
      signature: this.signature,
      nonce: this.nonce,
      fvsig: this.fvsig,
    }

    log.info('returning creds', { creds })

    return creds
  }

  async requestJWT(creds: Credentials): Promise<?Credentials | Error> {
    try {
      let { jwt } = await this.validateJWTExistenceAndExpiration()
      log.debug('jwt validation result:', { jwt })

      if (!jwt) {
        log.info('Calling server for authentication')
        const response = await API.fvauth(creds)
        const { status, data, statusText } = response

        log.info('Got auth response', response)

        if (200 !== status) {
          throw new Error(statusText)
        }

        log.debug('Login success:', data)
        jwt = data.token
      }

      return { ...creds, jwt }
    } catch (e) {
      const message = getErrorMessage(e)
      const exception = new Error(message)

      log.error('Login service auth failed:', message, exception)
      throw exception
    }
  }
}

export const useFVFlow = (signature, nonce, fvsig) => {
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

export const FVFlowContextProvider = props => {
  const fvParams = useRef(DeepLinking.params)
  const { sig, nonce, fvsig, rdu, cbu } = fvParams.current
  log.info('login params:', { sig, nonce, fvsig, rdu, cbu })

  const { jwt, error } = useFVFlow(sig, nonce, fvsig)

  return (
    <FVFlowContext.Provider
      value={{
        firstName: fvParams.current.firstName,
        faceIdentifier: (fvParams.current.fvsig || '').slice(0, 42),
        isFVFlow: Config.isFVFlow,
        fvflowError: error,
        isFVFlowReady: !!jwt,
        rdu,
        cbu,
      }}
    >
      {props.children}
    </FVFlowContext.Provider>
  )
}

export default FVFlow
