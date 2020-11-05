import { useCallback, useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { assign, noop } from 'lodash'

// logger & utils
import logger from '../../../../lib/logger/pino-logger'
import { isE2ERunning } from '../../../../lib/utils/platform'

// Zoom SDK reference & helpers
import api from '../api/FaceVerificationApi'
import { ZoomSDK } from '../sdk/ZoomSDK'
import { ExceptionType, kindOfSessionIssue } from '../utils/kindOfTheIssue'
import { MAX_RETRIES_ALLOWED, zoomResultSuccessMessage } from '../sdk/ZoomSDK.constants'
import { unloadZoomSDK } from './useZoomSDK'

const log = logger.child({ from: 'useZoomVerification' })
const emptyBase64 = btoa(String.fromCharCode(0x20).repeat(40))

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
export default (options = null) => {
  const {
    enrollmentIdentifier,
    onUIReady = noop,
    onCaptureDone = noop,
    onRetry = noop,
    onComplete = noop,
    onError = noop,
    maxRetries = MAX_RETRIES_ALLOWED,
  } = options || {}

  // Zoom session in progress flag to avoid begin
  // a new session until current is in progress
  // Shared via Ref
  const sessionInProgressRef = useRef(false)

  // creating refs for callbacks & options
  const onUIReadyRef = useRef(onUIReady)
  const onCaptureDoneRef = useRef(onCaptureDone)
  const onRetryRef = useRef(onRetry)
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)
  const maxRetriesRef = useRef(maxRetries)

  // and updating them once some of callbacks/options changes
  useEffect(() => {
    onUIReadyRef.current = onUIReady
    onCaptureDoneRef.current = onCaptureDone
    onRetryRef.current = onRetry
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
    maxRetriesRef.current = maxRetries
  }, [onUIReady, onCaptureDone, onRetry, onComplete, onError, maxRetries])

  // Starts verification/enrollment process
  // Wrapped to useCallback for incapsulate session in a single call
  // and execute corresponding callback on completion or error
  const startVerification = useCallback(async () => {
    // creating functions unwrapping callback refs
    // keeping theirs names the same like in the props
    // for avoid code modifications
    const [onUIReady, onCaptureDone, onRetry, onComplete, onError] = [
      onUIReadyRef,
      onCaptureDoneRef,
      onRetryRef,
      onCompleteRef,
      onErrorRef,
    ].map(ref => (...args) => ref.current(...args))

    // unwrapping options props
    const maxRetries = maxRetriesRef.current

    // if cypress is running
    if (isE2ERunning) {
      try {
        // don't start session, just call enroll with fake data
        // to whitelist user on server
        await api.performFaceVerification({
          enrollmentIdentifier,
          sessionId: uuid(),
          faceMap: emptyBase64,
          lowQualityAuditTrailImage: emptyBase64,
          auditTrailImage: emptyBase64,
        })
      } finally {
        // call onComplete callback with success state
        onComplete(zoomResultSuccessMessage)
      }

      return
    }

    // don't starting new session if it already runs
    if (sessionInProgressRef.current) {
      return
    }

    // preparing varification options object
    const verificationOptions = { onUIReady, onCaptureDone, onRetry, maxRetries }

    // setting session is running flag in the ref
    sessionInProgressRef.current = true

    log.debug('Starting Zoom verification', { enrollmentIdentifier, verificationOptions })

    // initializing zoom session
    try {
      const verificationStatus = await ZoomSDK.faceVerification(enrollmentIdentifier, verificationOptions)

      log.debug('Zoom verification successfull', { verificationStatus })

      await unloadZoomSDK(log)
      onComplete(verificationStatus)
    } catch (exception) {
      let { message, name } = exception

      // checking for duplicate case firstly because on any server error
      // we're calling zoomResultCallback.cancel() which returns us
      // an 'ProgrammaticallyCancelled' status which fills kindOfTheIssue
      // so check for duplicates case never performs
      name = message.startsWith('Duplicate')
        ? 'DuplicateFoundError'
        : // the following code is needed to categorize exceptions
          // then we could display specific error messages
          // corresponding to the kind of issue (camera, orientation, duplicate etc)
          kindOfSessionIssue(exception) || name

      const dialogShown = name === 'NotAllowedError'

      assign(exception, { type: ExceptionType.Session, name })
      log.error('Zoom verification failed', message, exception, { dialogShown })

      onError(exception)
    } finally {
      // setting session is not running flag in the ref
      sessionInProgressRef.current = false
    }
  }, [enrollmentIdentifier])

  // exposing public hook API
  return startVerification
}
