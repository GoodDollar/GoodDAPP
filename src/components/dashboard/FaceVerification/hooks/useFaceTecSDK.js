import { useEffect, useRef } from 'react'
import { assign, noop } from 'lodash'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'
import { isE2ERunning } from '../../../../lib/utils/platform'

import { FaceTecSDK } from '../sdk/FaceTecSDK'
import { ExceptionType, isCriticalIssue, kindOfSDKIssue } from '../utils/kindOfTheIssue'

const log = logger.child({ from: 'useFaceTecSDK' })

let zoomCriticalError = null

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

        // Initializing ZoOm
        await FaceTecSDK.initialize(zoomLicenseKey, zoomLicenseText, zoomEncryptionKey)

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
          zoomCriticalError = exception
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
    // TODO: probably store this flag it in the SDK and show preload dialog ?
    if (zoomCriticalError) {
      handleException(zoomCriticalError)
      return
    }

    // starting initialization
    initializeSdk()
  }, [])
}
