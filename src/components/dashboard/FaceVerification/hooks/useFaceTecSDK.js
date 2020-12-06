import { useEffect } from 'react'
import { assign, noop } from 'lodash'

import useRealtimeProps from '../../../../lib/hooks/useRealtimeProps'

import { FaceTecSDK } from '../sdk/FaceTecSDK'
import { ExceptionType, kindOfSDKIssue } from '../utils/kindOfTheIssue'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'
import { isE2ERunning } from '../../../../lib/utils/platform'
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
export default ({ onInitialized = noop, onError = noop }) => {
  // Configuration callbacks refs
  const accessors = useRealtimeProps([onInitialized, onError])
  const [faceTecCriticalError, handleCriticalError] = useCriticalErrorHandler(log)

  // performing initialization attempt on component mounted
  // this callback should be ran once, so we're using refs
  // to access actual initialization / error callbacks
  useEffect(() => {
    const [onInitialized, onError] = accessors
    const { faceTecLicenseKey, faceTecLicenseText, faceTecEncryptionKey } = Config

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
      try {
        log.debug('Initializing ZoomSDK')

        // Initializing ZoOm
        await FaceTecSDK.initialize(faceTecLicenseKey, faceTecEncryptionKey, faceTecLicenseText)

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
