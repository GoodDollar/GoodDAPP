import { useEffect } from 'react'
import { assign, noop } from 'lodash'

import useRealtimeProps from '../../../../lib/hooks/useRealtimeProps'

import FaceTecGlobalState from '../sdk/FaceTecGlobalState'
import { ExceptionType, isCriticalIssue, kindOfSDKIssue } from '../utils/kindOfTheIssue'

import logger from '../../../../lib/logger/pino-logger'
import { isE2ERunning } from '../../../../lib/utils/platform'
import useCriticalErrorHandler from './useCriticalErrorHandler'

const log = logger.child({ from: 'useFaceTecSDK' })

/**
 * FaceTecSDK preloading helper
 * Preloads SDK and longs success/failiure state
 *
 * @param {Object} logger Custom Pino logger child instance to use for logging
 * @returns {Promise}
 */
export const preloadFaceTecSDK = async (logger = log) => {
  const { faceTecSDKPreloaded, faceTecSDKPreloading, faceTecCriticalError, initialize } = FaceTecGlobalState

  // if cypress is running, already preloaded or loading in progress - do nothing
  if (isE2ERunning || faceTecSDKPreloaded || faceTecSDKPreloading || faceTecCriticalError) {
    return
  }

  logger.debug('Pre-loading FaceTec SDK')

  try {
    await (FaceTecGlobalState.faceTecSDKPreloading = initialize().finally(
      () => (FaceTecGlobalState.faceTecSDKPreloading = null),
    ))

    FaceTecGlobalState.zoomSDKPreloaded = true
    logger.debug('FaceTec SDK is preloaded')
  } catch (exception) {
    const { message } = exception

    // if it's an critical issue
    if (isCriticalIssue(exception)) {
      // set exception in the global state
      FaceTecGlobalState.faceTecCriticalError = exception
    }

    logger.error('Preloading FaceTec failed', message, exception)
  }
}

/**
 * ZoomSDK initialization hook
 *
 * @param {object} config Configuration
 * @property {() => void} config.onInitialized - SDK initialized callback
 * @property {() => void} config.onError - SDK error callback
 *
 * @return {void}
 */
export default ({ onInitialized = noop, onError = noop }) => {
  // Configuration callbacks refs
  const accessors = useRealtimeProps([onInitialized, onError])
  const handleCriticalError = useCriticalErrorHandler(log)

  // performing initialization attempt on component mounted
  // this callback should be ran once, so we're using refs
  // to access actual initialization / error callbacks
  useEffect(() => {
    const [onInitialized, onError] = accessors

    // Helper for handle exceptions
    const handleException = exception => {
      const { message } = exception

      // check & handle critical / resource errors
      handleCriticalError(exception)

      // executing current onError callback
      onError(exception)
      log.error('Zoom initialization failed', message, exception)
    }

    const initializeSdk = async () => {
      const { faceTecSDKPreloaded, faceTecSDKPreloading, initialize } = FaceTecGlobalState

      try {
        log.debug('Initializing ZoomSDK')

        // Initializing ZoOm
        if (!faceTecSDKPreloaded) {
          await (faceTecSDKPreloading || initialize())
        }

        // Executing onInitialized callback
        onInitialized()
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
    }

    const { faceTecSDKPreloaded, faceTecCriticalError } = FaceTecGlobalState

    // if cypress is running  or already preloaded - do nothing and immediately call success callback
    if (isE2ERunning || faceTecSDKPreloaded) {
      onInitialized()
      return
    }

    // skipping initialization attempt is some
    // unrecoverable error happened last try
    // TODO: probably store this flag it in the SDK and show preload dialog ?
    if (faceTecCriticalError) {
      handleException(faceTecCriticalError)
      return
    }

    // starting initialization
    initializeSdk()
  }, [])
}
