// @flow
import React, { createContext, useEffect, useRef, useState } from 'react'
import type { Credentials } from '../../../../lib/API/api'
import logger from '../../../../lib/logger/js-logger'
import API, { getErrorMessage } from '../../../../lib/API/api'
import DeepLinking from '../utils/deepLinking'
import LoginService from '../../../../lib/login/LoginService'
import Config from '../../../../config/config'

const log = logger.child({ from: 'LoginFlowCtx' })
const { isLoginFlow } = Config

export const LoginFlowContext = createContext({
  firstName: null,
  faceIdentifier: null,
  isLoginFlow
})

const LoginFlowProvider = props => {
  const fvParams = useRef(DeepLinking.params)
  const { sig, nonce, fvsig, rdu, cbu } = fvParams.current
  log.info('login params:', { sig, nonce, fvsig, rdu, cbu })

  const { jwt, error } = useFVFlow(sig, nonce, fvsig)

  return (
    <FVFlowContext.Provider
      value={{
        firstName: fvParams.current.firstName,
        faceIdentifier: (fvParams.current.fvsig || '').slice(0, 42),
        isLoginFlow,
        loginFlowError: error,
        isLoginFlowReady: !!jwt,
        rdu,
        cbu,
      }}
    >
      {props.children}
    </FVFlowContext.Provider>
  )
}

export default LoginFlowProvider
