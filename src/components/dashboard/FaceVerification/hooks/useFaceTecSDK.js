import { useEffect } from 'react'
import { assign, noop } from 'lodash'

import useRealtimeProps from '../../../../lib/hooks/useRealtimeProps'

import { ExceptionType, kindOfSDKIssue } from '../utils/kindOfTheIssue'

import logger from '../../../../lib/logger/pino-logger'
import { isE2ERunning } from '../../../../lib/utils/platform'

import FaceTecGlobalState from '../sdk/FaceTecGlobalState'
import useCriticalErrorHandler from './useCriticalErrorHandler'

const log = logger.child({ from: 'useFaceTecSDK' })

/**
 * ZoomSDK initialization hook
 *
 * @param {object} config Configuration
 * @property {() => void} config.onInitialized - SDK initialized callback
 * @property {() => void} config.onError - SDK error callback
 *
 * @return {void}
 */
export default eventHandlers => {
  // Configuration callbacks refs
  const { onInitialized = noop, onError = noop } = eventHandlers || {}
  const accessors = useRealtimeProps([onInitialized, onError])

  // adding error handler
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
      let { faceTecSDKInitializing, initialize } = FaceTecGlobalState

      try {
        // Initializing ZoOm
        log.debug('Initializing ZoomSDK')

        if (!faceTecSDKInitializing) {
          // if not initializing - calling initialize sdk
          faceTecSDKInitializing = initialize()

          // storing onto global state
          assign(FaceTecGlobalState, { faceTecSDKInitializing })

          // clearing initializing promise reference when finished
          faceTecSDKInitializing = faceTecSDKInitializing.finally(
            () => (FaceTecGlobalState.faceTecSDKInitializing = null),
          )
        }

        // awaiting previous or current initialize call
        await faceTecSDKInitializing

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

    // if cypress is running - do nothing and immediately call success callback
    if (isE2ERunning) {
      onInitialized()
      return
    }

    const { faceTecCriticalError } = FaceTecGlobalState

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
