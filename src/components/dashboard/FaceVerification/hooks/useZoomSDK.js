import { useEffect, useRef } from 'react'
import { assign, noop } from 'lodash'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'
import { isE2ERunning } from '../../../../lib/utils/platform'

import { ZoomSDK } from '../sdk/ZoomSDK'
import { ExceptionType, isCriticalIssue, kindOfSDKIssue } from '../utils/kindOfTheIssue'

const log = logger.child({ from: 'useZoomSDK' })

const ZoomGlobalState = {
  zoomSDKPreloaded: false,
  zoomSDKPreloadFailed: false,
  zoomCriticalError: null,
}

/**
 * ZoomSDK preloading helper
 * Preloads SDK and longs success/failiure state
 *
 * @param {Object} logger Custom Pino logger child instance to use for logging
 * @returns {Promise}
 */
export const preloadZoomSDK = async (logger = log) => {
  const { zoomSDKPreloaded, zoomSDKPreloadFailed, zoomCriticalError } = ZoomGlobalState

  // if cypress is running - do nothing
  if (isE2ERunning) {
    return
  }

  logger.debug('Pre-loading Zoom SDK')

  try {
    if (zoomSDKPreloaded) {
      return
    }

    if (zoomCriticalError) {
      throw zoomCriticalError
    }

    if (zoomSDKPreloadFailed) {
      ZoomGlobalState.zoomSDKPreloadFailed = false
    }

    await ZoomSDK.preload()

    ZoomGlobalState.zoomSDKPreloaded = true
    logger.debug('Zoom SDK is preloaded')
  } catch (exception) {
    const { message } = exception

    ZoomGlobalState.zoomSDKPreloadFailed = true
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
    ZoomGlobalState.zoomSDKPreloadFailed = false
    logger.debug('Zoom SDK is unloaded')
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
    const { zoomSDKPreloadFailed, zoomCriticalError } = ZoomGlobalState
    const { zoomLicenseKey, zoomLicenseText, zoomEncryptionKey } = Config

    // Helper for handle exceptions
    const handleException = exception => {
      const { message } = exception

      // executing current onError callback
      onErrorRef.current(exception)
      log.error('Zoom initialization failed', message, exception)
    }

    const initializeSdk = async () => {
      try {
        log.debug('Initializing ZoomSDK')

        // retry preload Zoom if it was failed becase preload argument was removed
        // as it's not supported if we would like to pass encryption key or initialize
        // ZoOm in the production mode
        if (zoomSDKPreloadFailed) {
          await preloadZoomSDK()
        }

        // Initializing ZoOm
        await ZoomSDK.initialize(zoomLicenseKey, zoomLicenseText, zoomEncryptionKey)

        // Executing onInitialized callback
        onInitializedRef.current()
        log.debug('ZoomSDK is ready')
      } catch (exception) {
        // the following code is needed to categorize exceptions
        // then we could display specific error messages
        // corresponding to the kind of issue (camera, orientation etc)
        let { name } = exception

        name = kindOfSDKIssue(exception) || name
        assign(exception, { type: ExceptionType.SDK, name })

        // if some unrecoverable error happens
        // checking exception as unrecoverable could be thrown from ZoomSDK
        if (isCriticalIssue(name)) {
          // setting exception in the global state
          ZoomGlobalState.zoomCriticalError = exception

          // unloading SDK to free resources
          await unloadZoomSDK()
        }

        // handling initialization exceptions
        handleException(exception)
      }
    }

    // if cypress is running - do nothing and immediately call success callback
    if (isE2ERunning) {
      onInitializedRef.current()
      return
    }

    // skipping initialization attempt is some
    // unrecoverable error happened last try
    if (zoomCriticalError) {
      handleException(zoomCriticalError)
      return
    }

    // starting initialization
    initializeSdk()
  }, [])
}
