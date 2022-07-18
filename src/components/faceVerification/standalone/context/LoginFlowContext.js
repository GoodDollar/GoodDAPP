// @flow
import React, { createContext, useEffect, useRef } from 'react'

import useLoginFlow from '../hooks/useLoginFlow'
import DeepLinking from '../../../../lib/utils/deepLinking'

import logger from '../../../../lib/logger/js-logger'
import Config from '../../../../config/config'

const log = logger.child({ from: 'LoginFlowCtx' })
const { isLoginFlow } = Config

export const LoginFlowContext = createContext({
  isLoginFlow,
  firstName: null,
  faceIdentifier: null,
  loginFlowError: null,
  isLoginFlowReady: false,
  rdu: null,
  cbu: null,
})

const LoginFlowProvider = props => {
  const fvParams = useRef(DeepLinking.params)
  const { sig, nonce, fvsig, rdu, cbu, firstName } = fvParams.current
  const { jwt, error } = useLoginFlow(sig, nonce, fvsig)
  const faceIdentifier = (fvsig || '').slice(0, 42)

  useEffect(() => {
    log.info('login params:', { sig, nonce, fvsig, rdu, cbu, firstName })
  }, [])

  useEffect(() => {
    log.info('login result:', { jwt, error })
  }, [jwt, error])

  return (
    <LoginFlowContext.Provider
      value={{
        firstName,
        faceIdentifier,
        isLoginFlow,
        loginFlowError: error,
        isLoginFlowReady: !!jwt,
        rdu,
        cbu,
      }}
    >
      {props.children}
    </LoginFlowContext.Provider>
  )
}

export default LoginFlowProvider
