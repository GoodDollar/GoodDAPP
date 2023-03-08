import { useCallback, useContext, useEffect, useState } from 'react'
import { assign, noop } from 'lodash'

import { ExceptionType, kindOfSDKIssue } from '../utils/kindOfTheIssue'
import { hideRedBoxIfNonCritical } from '../utils/redBox'

import FaceTecGlobalState from '../sdk/FaceTecGlobalState'
import { FVFlowContext } from '../standalone/context/FVFlowContext'

import usePropsRefs from '../../../lib/hooks/usePropsRefs'

import logger from '../../../lib/logger/js-logger'
import { isEmulator } from '../../../lib/utils/platform'
import useCriticalErrorHandler from './useCriticalErrorHandler'

const log = logger.child({ from: 'useFaceTecSDK' })

/**
 * ZoomSDK initialization hook
 *
 * @param {object} config Configuration
 * @property {boolean} config.initOnMounted - should SDK be initialized on mount
 * @property {() => void} config.onInitialized - SDK initialized callback
 * @property {() => void} config.onError - SDK error callback
 *
 * @return {void}
 */
export default (config = {}) => {
  // parse options
  const { initOnMounted = true, onInitialized = noop, onError = noop } = config

  // state vars
  const [initialized, setInitialized] = useState(false)
  const [lastError, setLastError] = useState(null)

  // FVFlow ctx
  const { isFVFlow, isFVFlowReady } = useContext(FVFlowContext)

  // Configuration callbacks refs
  const refs = usePropsRefs([onInitialized, onError, setInitialized, setLastError])

  // adding error handler
  const handleCriticalError = useCriticalErrorHandler(log)

  // initialization flag. will be set to true if initOnMounted was true and no fvflow or fvflow is ready
  const shouldInitialize = initOnMounted && (!isFVFlow || isFVFlowReady)

  // initialize flow fn
  const initializeSdk = useCallback(async () => {
    const [onInitialized, onError, setInitialized, setLastError] = refs
    const { faceTecCriticalError } = FaceTecGlobalState

    // Helper for handle exceptions
    const handleException = exception => {
      const { message } = exception

      // check & handle critical / resource errors
      handleCriticalError(exception)

      // executing current onError callback
      onError(exception)
      setLastError(exception)
      hideRedBoxIfNonCritical(exception, () => log.error('Zoom initialization failed', message, exception))
    }

    // skipping initialization attempt is some
    // unrecoverable error happened last try
    // TODO: probably store this flag it in the SDK and show preload dialog ?
    if (faceTecCriticalError) {
      handleException(faceTecCriticalError)
      return
    }

    try {
      // Initializing ZoOm
      log.debug('Initializing ZoomSDK')

      const isDeviceEmulated = await isEmulator

      // if cypress is running - do nothing and immediately call success callback
      if (!isDeviceEmulated) {
        await FaceTecGlobalState.initialize()
      }

      // Executing onInitialized callback
      onInitialized()
      setInitialized(true)
      log.debug('ZoomSDK is ready')
    } catch (exception) {
      // the following code is needed to categorize exceptions
      // then we could display specific error messages
      // corresponding to the kind of issue (camera, orientation etc)
      let { name } = exception

      name = kindOfSDKIssue(exception) || name
      assign(exception, { type: ExceptionType.SDK, name })

      // handling initialization exceptions
      handleException(exception)
    }
  }, [])

  // once shouldInitialize become true - initialize sdk
  // if initOnMounted was false this never happed so initializeSdk
  // function exported from hook should be used in such case
  useEffect(() => {
    if (!shouldInitialize) {
      return
    }

    // starting initialization
    initializeSdk()
  }, [shouldInitialize])

  return [initialized, lastError, initializeSdk]
}
