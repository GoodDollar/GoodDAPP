// @flow
import React, { createContext, useEffect, useRef } from 'react'

import useFVFlow from '../hooks/useFVFlow'
import DeepLinking from '../../../../lib/utils/deepLinking'

import logger from '../../../../lib/logger/js-logger'
import Config from '../../../../config/config'

const log = logger.child({ from: 'LoginFlowCtx' })
const { isFVFlow } = Config

export const FVFlowContext = createContext({
  isFVFlow,
  firstName: null,
  faceIdentifier: null,
  fvFlowError: null,
  isFVFlowReady: false,
  rdu: null,
  cbu: null,
})

const FVFlowProvider = props => {
  const { sig, nonce, fvsig, rdu, cbu, firstName } = useRef(DeepLinking.params).current
  const { jwt, error } = useFVFlow(sig, nonce, fvsig)
  const faceIdentifier = (fvsig || '').slice(0, 42)

  useEffect(() => {
    log.info('login params:', { sig, nonce, fvsig, rdu, cbu, firstName })
  }, [])

  useEffect(() => {
    log.info('login result:', { jwt, error })
  }, [jwt, error])

  return (
    <FVFlowContext.Provider
      value={{
        firstName,
        faceIdentifier,
        isFVFlow,
        fvFlowError: error,
        isFVFlowReady: !!jwt,
        rdu,
        cbu,
      }}
    >
      {props.children}
    </FVFlowContext.Provider>
  )
}

export default FVFlowProvider
