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
import { zoomResultSuccessMessage } from '../utils/strings'
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
export default ({
  enrollmentIdentifier,
  onUIReady = noop,
  onCaptureDone = noop,
  onRetry = noop,
  onComplete = noop,
  onError = noop,
}) => {
  // Zoom session in progress flag to avoid begin
  // a new session until current is in progress
  // Shared via Ref
  const sessionInProgressRef = useRef(false)

  // creating refs for callback
  const onUIReadyRef = useRef()
  const onCaptureDoneRef = useRef()
  const onRetryRef = useRef()
  const onCompleteRef = useRef()
  const onErrorRef = useRef()

  // and updating them once some of callbacks changes
  useEffect(() => {
    onUIReadyRef.current = onUIReady
    onCaptureDoneRef.current = onCaptureDone
    onRetryRef.current = onRetry
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
  }, [onUIReady, onCaptureDone, onRetry, onComplete, onError])

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

    // setting session is running flag in the ref
    sessionInProgressRef.current = true

    log.debug('Starting Zoom verification', { enrollmentIdentifier })

    // initializing zoom session
    try {
      const verificationStatus = await ZoomSDK.faceVerification(enrollmentIdentifier, onUIReady, onCaptureDone, onRetry)

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

      assign(exception, { type: ExceptionType.Session, name })
      log.error('Zoom verification failed', message, exception, { dialogShown: true })
      onError(exception)
    } finally {
      // setting session is not running flag in the ref
      sessionInProgressRef.current = false
    }
  }, [enrollmentIdentifier])

  // exposing public hook API
  return startVerification
}
