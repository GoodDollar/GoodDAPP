import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'
import useMountedState from '../../../../lib/hooks/useMountedState'
import { ZoomSDK } from '../sdk/ZoomSDK'

const log = logger.child({ from: 'useZoomSDK' })

/**
 * ZoomSDK preloading helper
 * Preloads SDK and longs success/failiure stage
 *
 * @param {Object} logger Custom Pino logger chuld instance to use for logging
 * @returns {Promise}
 */
export const preloadZoomSDK = async (logger = log) => {
  logger.debug('Pre-loading Zoom SDK')

  try {
    await ZoomSDK.preload()

    logger.debug('Zoom SDK is preloaded')
  } catch (exception) {
    const { message } = exception

    logger.error('preloading zoom failed', message, exception)
  }
}

/**
 * ZoomSDK initialization hook
 *
 * @param {object} config Configuration
 * @property {() => void} config.onInitialized - SDK initialized callback
 * @property {() => void} config.onError - SDK error callback
 *
 * @return {boolean} Initialization state flag
 */
export default ({ onInitialized = noop, onError = noop }) => {
  // Initialization state flag
  const [isInitialized, setInitialized] = useState(false)

  // Component mounted flag ref, it needs to check
  // is component still mounted before update it's state
  // This check is needed as onInitialized/onError could
  // perform redirects which unmounts component
  const mountedStateRef = useMountedState()

  // Configuration callbacks refs
  const onInitializedRef = useRef(null)
  const onErrorRef = useRef(null)

  // updating callbacks references on config changes
  useEffect(() => {
    onInitializedRef.current = onInitialized
    onErrorRef.current = onError
  }, [onInitialized, onError])

  // performing initialization attempt on component mounted
  // this callback should be ran once, so we're using refs
  // to access actual initialization / error callbacks
  useEffect(() => {
    // Helper for handle exceptions
    const handleException = exception => {
      const { message } = exception

      // executing current onError callback
      onErrorRef.current(exception)
      log.error('Zoom initialization failed', message, exception)
    }

    // Helper for handle SDK status code changes
    const handleSdkInitialized = () => {
      // Executing onInitialized callback
      onInitializedRef.current()

      // and updating isInitialized state flag
      // (if component is still mounted)
      if (mountedStateRef.current) {
        setInitialized(true)
      }
    }

    const initializeSdk = async () => {
      try {
        log.debug('Initializing ZoomSDK')

        // Initializing ZoOm, this also performs preload
        await ZoomSDK.initialize(Config.zoomLicenseKey)

        // Setting initialized state
        handleSdkInitialized()
        log.debug('ZoomSDK is ready')
      } catch (exception) {
        // handling initialization exceptions
        handleException(exception)
      }
    }

    // starting initialization
    initializeSdk()
  }, [])

  // exposing public hook API
  return isInitialized
}
