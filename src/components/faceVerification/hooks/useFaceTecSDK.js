import { useEffect, useState } from 'react'
import { assign, noop } from 'lodash'

import usePropsRefs from '../../../lib/hooks/usePropsRefs'

import { ExceptionType, kindOfSDKIssue } from '../utils/kindOfTheIssue'
import { hideRedBoxIfNonCritical } from '../utils/redBox'

import logger from '../../../lib/logger/js-logger'
import { isEmulator } from '../../../lib/utils/platform'

import FaceTecGlobalState from '../sdk/FaceTecGlobalState'
import useCriticalErrorHandler from './useCriticalErrorHandler'

const log = logger.child({ from: 'useFaceTecSDK' })

/**
 * ZoomSDK initialization hook
 *
 * @param {object} config Configuration
 * @property {boolean} config.initializeOnMount - should SDK be initialized on mount
 * @property {() => void} config.onInitialized - SDK initialized callback
 * @property {() => void} config.onError - SDK error callback
 *
 * @return {void}
 */
export default (config = {}) => {
  // parse options
  const { initializeOnMount = true, onInitialized = noop, onError = noop } = config

  // state vars
  const [initialized, setInitialized] = useState(false)
  const [lastError, setLastError] = useState(null)

  // Configuration callbacks refs
  const refs = usePropsRefs([initializeOnMount, onInitialized, onError, setInitialized, setLastError])

  // adding error handler
  const handleCriticalError = useCriticalErrorHandler(log)

  // performing initialization attempt on component mounted
  // this callback should be ran once, so we're using refs
  // to access actual initialization / error callbacks
  useEffect(() => {
    const [getInitializeOnMount, onInitialized, onError, setInitialized, setLastError] = refs

    if (getInitializeOnMount() === false) {
      return
    }

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

    const initializeSdk = async () => {
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

  return [initialized, lastError]
}
