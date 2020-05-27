import { useCallback, useRef } from 'react'
import { noop } from 'lodash'

// logger
import logger from '../../../../lib/logger/pino-logger'

// Zoom SDK reference & helpers
import { ZoomSDK } from '../sdk/ZoomSDK'
import { kindOfSessionIssue } from '../utils/kindOfTheIssue'
import { unloadZoomSDK } from './useZoomSDK'

// Zoom exceptions helper

const log = logger.child({ from: 'useZoomVerification' })

/**
 * ZoomSDK face verification & fecamap enrollment hook
 *
 * @param {object} config Configuration
 * @property {string} config.enrollmentIdentifier Unique identifier string used for identify enrollment
 * @property {(lastMessage: string) => void} config.onSuccess Verification completion callback
 * @property @param {string} config.onSuccess.lastMessage Last status message (got from session status, server response or error thrown)
 * @property {(error: Error) => void} config.onError - Verfifcication error callback
 *
 * @return {async () => Promise<void>} Function that starts verification/enrollment process
 */
export default ({ enrollmentIdentifier, onUIReady = noop, onComplete = noop, onError = noop }) => {
  // Zoom session in progress flag to avoid begin
  // a new session until current is in progress
  // Shared via Ref
  const sessionInProgressRef = useRef(false)

  // Starts verification/enrollment process
  // Wrapped to useCallback for incapsulate session in a single call
  // and execute corresponding callback on completion or error
  const startVerification = useCallback(async () => {
    // don't starting new session if it already runs
    if (sessionInProgressRef.current) {
      return
    }

    // setting session is running flag in the ref
    sessionInProgressRef.current = true

    log.debug('Starting Zoom verification', { enrollmentIdentifier })

    // initializing zoom session
    try {
      const verificationStatus = await ZoomSDK.faceVerification(enrollmentIdentifier, onUIReady)

      log.debug('Zoom verification successfull', { verificationStatus })

      await unloadZoomSDK(log)
      onComplete(verificationStatus)
    } catch (exception) {
      // the following code is needed to categorize exceptions
      // then we could display specific error messages
      // corresponding to the kind of issue (camera, orientation, duplicate etc)
      const kindOfTheIssue = kindOfSessionIssue(exception)
      const { message } = exception

      if (kindOfTheIssue) {
        exception.name = kindOfTheIssue
      } else if (exception.message.startsWith('Duplicate')) {
        exception.name = 'DuplicateFoundError'
      }

      log.error('Zoom verification failed', message, exception)
      onError(exception)
    } finally {
      // setting session is not running flag in the ref
      sessionInProgressRef.current = false
    }
  }, [enrollmentIdentifier, onUIReady, onComplete, onError])

  // exposing public hook API
  return startVerification
}
