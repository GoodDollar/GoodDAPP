import { useContext, useEffect, useRef } from 'react'
import { FVFlowContext } from '../standalone/context/FVFlowContext'
import useFaceTecSDK from './useFaceTecSDK'

export default (config = {}) => {
  const { initOnMounted = true, ...opts } = config
  const { isFVFlow, isFVFlowReady } = useContext(FVFlowContext)
  const initOnMountedRef = useRef(initOnMounted)

  // eslint-disable-next-line prettier/prettier
  const [initialized, lastError, initializeSdk] = useFaceTecSDK({ 
    initOnMounted: initOnMounted && (isFVFlow ? isFVFlowReady : true),
    ...opts,
  })

  // init SDK after fvlogin ONLY
  useEffect(() => {
    // and if the original initOnMounted was true
    if (initOnMountedRef.current && isFVFlow && isFVFlowReady) {
      initializeSdk()
    }
  }, [isFVFlow, isFVFlowReady])

  return [initialized, lastError]
}
