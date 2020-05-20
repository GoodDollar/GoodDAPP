import { useEffect, useRef } from 'react'
import { noop } from 'lodash'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'
import { ZoomSDK } from '../sdk/ZoomSDK'
import { kindOfSDKIssue } from '../utils/kindOfTheIssue'

const log = logger.child({ from: 'useZoomSDK' })

const ZoomGlobalState = {
  zoomSDKPreloaded: false,
  zoomUnrecoverableError: null,
}

/**
 * ZoomSDK preloading helper
 * Preloads SDK and longs success/failiure state
 *
 * @param {Object} logger Custom Pino logger child instance to use for logging
 * @returns {Promise}
 */
export const preloadZoomSDK = async (logger = log) => {
  const { zoomSDKPreloaded, zoomUnrecoverableError } = ZoomGlobalState

  logger.debug('Pre-loading Zoom SDK')

  try {
    if (zoomSDKPreloaded) {
      return
    }

    if (zoomUnrecoverableError) {
      throw zoomSDKPreloaded
    }

    await ZoomSDK.preload()

    ZoomGlobalState.zoomSDKPreloaded = true
    logger.debug('Zoom SDK is preloaded')
  } catch (exception) {
    const { message } = exception

    logger.error('preloading zoom failed', message, exception)
  }
}

/**
 * ZoomSDK unloading helper
 * Unloads SDK and longs success/failiure state
 *
 * @param {Object} logger Custom Pino logger child instance to use for logging
 * @returns {Promise}
 */
export const unloadZoomSDK = async (logger = log) => {
  const { zoomSDKPreloaded } = ZoomGlobalState

  logger.debug('Unloading Zoom SDK')

  try {
    if (!zoomSDKPreloaded) {
      return
    }

    await ZoomSDK.unload()

    ZoomGlobalState.zoomSDKPreloaded = false
    logger.debug('Zoom SDK is umloaded')
  } catch (exception) {
    const { message } = exception

    logger.error('unloading zoom failed', message, exception)
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
    const handleException = async exception => {
      const { message, name } = exception

      // if name is set - that means error was rethrown
      // otherwise we should determine kind of the issue
      if (!name) {
        // the following code is needed to categorize exceptions
        // then we could display specific error messages
        // corresponding to the kind of issue (camera, orientation etc)
        const kindOfTheIssue = kindOfSDKIssue(exception)

        if (kindOfTheIssue) {
          exception.name = kindOfTheIssue
        }

        // if some unrecoverable error happens
        if ('UnrecoverableError' === kindOfTheIssue) {
          // setting exception in the global state
          ZoomGlobalState.zoomUnrecoverableError = exception

          // unloading SDK to free resources
          await unloadZoomSDK()
        }
      }

      // executing current onError callback
      onErrorRef.current(exception)
      log.error('Zoom initialization failed', message, exception)
    }

    const initializeSdk = async () => {
      const { zoomSDKPreloaded, zoomUnrecoverableError } = ZoomGlobalState

      try {
        log.debug('Initializing ZoomSDK')

        if (zoomUnrecoverableError) {
          throw zoomUnrecoverableError
        }

        // Initializing ZoOm
        // if preloading wasn't attempted or wasn't successfull, we also setting preload flag
        await ZoomSDK.initialize(Config.zoomLicenseKey, !zoomSDKPreloaded)

        // Executing onInitialized callback
        onInitializedRef.current()
        log.debug('ZoomSDK is ready')
      } catch (exception) {
        // handling initialization exceptions
        await handleException(exception)
      }
    }

    // starting initialization
    initializeSdk()
  }, [])
}
