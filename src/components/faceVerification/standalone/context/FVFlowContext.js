// @flow
import React, { createContext, useEffect, useRef } from 'react'

import useFVFlow from '../hooks/useFVFlow'
import DeepLinking from '../../../../lib/utils/deepLinking'

import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'FVFlowCtx' })

export const FVFlowContext = createContext({
  account: null,
  isFVFlow: false, // false as default will be changed to true on first provider render
  firstName: null,
  faceIdentifier: null,
  fvFlowError: null,
  isFVFlowReady: false,
  rdu: null,
  cbu: null,
})

const FVFlowProvider = props => {
  const { sig, nonce, fvsig, rdu, cbu, firstName, account } = useRef(DeepLinking.params).current
  const { jwt, error } = useFVFlow(sig, nonce, fvsig, account)
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
        account,
        firstName,
        faceIdentifier,
        isFVFlow: true, // when we render this provider we are always in fvflow
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
