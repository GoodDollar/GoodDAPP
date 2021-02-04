import { useCallback, useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { assign, noop } from 'lodash'

// logger & utils
import logger from '../../../../lib/logger/pino-logger'
import { isAndroidNative, isE2ERunning } from '../../../../lib/utils/platform'

// Zoom SDK reference & helpers
import api from '../api/FaceVerificationApi'
import { FaceTecSDK } from '../sdk/FaceTecSDK'
import { ExceptionType, kindOfSessionIssue } from '../utils/kindOfTheIssue'
import { MAX_RETRIES_ALLOWED, resultSuccessMessage } from '../sdk/FaceTecSDK.constants'
import useRealtimeProps from '../../../../lib/hooks/useRealtimeProps'

const log = logger.child({ from: 'useFaceTecVerification' })
const emptyBase64 = btoa(String.fromCharCode(0x20).repeat(40))

/**
 * FaceTecSDK face verification & fecamap enrollment hook
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

  // creating accessors for callbacks & options
  const accessors = useRealtimeProps([onUIReady, onCaptureDone, onRetry, onComplete, onError, maxRetries])

  // Starts verification/enrollment process
  // Wrapped to useCallback for incapsulate session in a single call
  // and execute corresponding callback on completion or error
  const startVerification = useCallback(async () => {
    // destructuring accessors keeping theirs names the
    // same like in the props for avoid code modifications
    const [onUIReady, onCaptureDone, onRetry, onComplete, onError, getMaxRetries] = accessors

    // if cypress is running
    if (isE2ERunning || isAndroidNative) {
      try {
        // don't start session, just call enroll with fake data
        // to whitelist user on server
        await api.performFaceVerification({
          sessionId: uuid(),
          enrollmentIdentifier,
          faceScan: emptyBase64,
          auditTrailImage: emptyBase64,
          lowQualityAuditTrailImage: emptyBase64,
        })
      } finally {
        // call onComplete callback with success state
        onComplete(resultSuccessMessage)
      }

      return
    }

    // don't starting new session if it already runs
    if (sessionInProgressRef.current) {
      return
    }

    // preparing varification options object
    const maxRetries = getMaxRetries()
    const verificationOptions = { onUIReady, onCaptureDone, onRetry, maxRetries }

    // setting session is running flag in the ref
    sessionInProgressRef.current = true

    log.debug('Starting Zoom verification', { enrollmentIdentifier, verificationOptions })

    // initializing zoom session
    try {
      const verificationStatus = await FaceTecSDK.faceVerification(enrollmentIdentifier, verificationOptions)

      log.debug('Zoom verification successfull', { verificationStatus })
      onComplete(verificationStatus)
    } catch (exception) {
      let { message, name } = exception

      // checking for duplicate / failed match-3d case firstly because
      // on any server error we're calling faceTecResultCallback.cancel()
      // which returns us an 'ProgrammaticallyCancelled' status which
      // fills kindOfTheIssue so check for duplicates case never performs
      if (message.startsWith('Duplicate')) {
        name = 'DuplicateFoundError'
      } else if (/face.+n.t\s+match/.test(message)) {
        name = 'NotMatchError'
      } else {
        // the following code is needed to categorize exceptions
        // then we could display specific error messages
        // corresponding to the kind of issue (camera, orientation, duplicate etc)
        const kindOfTheIssue = kindOfSessionIssue(exception)

        if (kindOfTheIssue) {
          name = kindOfTheIssue
        }
      }

      const dialogShown = name === 'NotAllowedError'

      assign(exception, { type: ExceptionType.Session, name })
      log.error('Zoom verification failed', message, exception, { dialogShown })

      onError(exception)
    } finally {
      // setting session is not running flag in the ref
      sessionInProgressRef.current = false
    }
  }, [enrollmentIdentifier, accessors])

  // exposing public hook API
  return startVerification
}
