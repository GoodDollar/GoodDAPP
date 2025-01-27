// @flow
import React, { createContext, useEffect, useRef } from 'react'
import { decompressFromEncodedURIComponent } from 'lz-string'
import useFVFlow from '../hooks/useFVFlow'
import DeepLinking from '../../../../lib/utils/deepLinking'

import { isWebView } from '../../../../lib/utils/platform'

import logger from '../../../../lib/logger/js-logger'

const log = logger.child({ from: 'FVFlowCtx' })

export const FVFlowContext = createContext({
  account: null,
  isFVFlow: false, // false as default will be changed to true on first provider render
  firstName: null,
  faceIdentifier: null,
  fvFlowError: null,
  isFVFlowReady: false,
  chain: null,
  rdu: null,
  cbu: null,
  isWebView: false,
  unsupportedCopyUrl: null,
  isDelta: false,
})

const FVFlowProvider = props => {
  const unsupportedCopyUrl = DeepLinking.link

  const params = useRef(DeepLinking.params).current

  // new version compresses params to support large signatures
  const decompressed = JSON.parse(decompressFromEncodedURIComponent(params.lz) || '{}')
  const {
    sig,
    nonce,
    fvsig: faceIdentifier,
    rdu,
    cbu,
    firstName,
    account,
    chain,
    isDelta,
  } = { ...params, ...decompressed }

  const { jwt, error } = useFVFlow(sig, nonce, faceIdentifier, account)

  useEffect(() => {
    log.info('login params:', { sig, nonce, faceIdentifier, rdu, cbu, firstName })
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
        chainId: chain,
        rdu,
        cbu,
        isWebView,
        unsupportedCopyUrl,
        isDelta,
      }}
    >
      {props.children}
    </FVFlowContext.Provider>
  )
}

export default FVFlowProvider
