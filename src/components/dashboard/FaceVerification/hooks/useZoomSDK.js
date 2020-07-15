import { useEffect, useRef } from 'react'
import { noop } from 'lodash'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'
import { isE2ERunning } from '../../../../lib/utils/platform'

import { ZoomSDK } from '../sdk/ZoomSDK'
import { kindOfSDKIssue } from '../utils/kindOfTheIssue'

const log = logger.child({ from: 'useZoomSDK' })

const ZoomGlobalState = {
  zoomSDKPreloaded: false,
  zoomSDKPreloadFailed: false,
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
  const { zoomSDKPreloaded, zoomSDKPreloadFailed, zoomUnrecoverableError } = ZoomGlobalState

  // if cypress is running - do nothing
  if (isE2ERunning) {
    return
  }

  logger.debug('Pre-loading Zoom SDK')

  try {
    if (zoomSDKPreloaded) {
      return
    }

    if (zoomUnrecoverableError) {
      throw zoomUnrecoverableError
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
    const { zoomSDKPreloadFailed, zoomUnrecoverableError } = ZoomGlobalState
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
          try {
            await preloadZoomSDK()
          } catch ({ message }) {
            // in case of preload was failed (in a general case) - throw UnrecoverableError
            // if unrecoverable error (e.g. 65321) happened, don't rethrow it, because
            // it will be cought by the SDK on the next initialize call
            if (message.includes('issue was encountered preloading ZoOm')) {
              const exception = new Error('Preload was not completed or an issue was encountered preloading ZoOm')

              exception.name = 'UnrecoverableError'
              throw exception
            }
          }
        }

        // Initializing ZoOm
        // if preloading wasn't attempted or wasn't successfull, we also setting preload flag
        const isInitialized = await ZoomSDK.initialize(zoomLicenseKey, zoomLicenseText, zoomEncryptionKey)

        if (isInitialized) {
          // Executing onInitialized callback
          onInitializedRef.current()
          log.debug('ZoomSDK is ready')
        }
      } catch (exception) {
        // the following code is needed to categorize exceptions
        // then we could display specific error messages
        // corresponding to the kind of issue (camera, orientation etc)
        const kindOfTheIssue = kindOfSDKIssue(exception)

        if (kindOfTheIssue) {
          exception.name = kindOfTheIssue
        }

        // if some unrecoverable error happens
        // checking exception.name as 'UnrecoverableError' coiud be thrown from ZoomSDK
        if ('UnrecoverableError' === exception.name) {
          // setting exception in the global state
          ZoomGlobalState.zoomUnrecoverableError = exception

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
    if (zoomUnrecoverableError) {
      handleException(zoomUnrecoverableError)
      return
    }

    // starting initialization
    initializeSdk()
  }, [])
}
