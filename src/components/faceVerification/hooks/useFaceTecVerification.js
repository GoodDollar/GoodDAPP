import { useCallback, useRef } from 'react'
import { assign, noop } from 'lodash'

// logger & utils
import logger from '../../../lib/logger/js-logger'
import { isEmulator } from '../../../lib/utils/platform'

// Zoom SDK reference & helpers
import api from '../api/FaceVerificationApi'
import { FaceTecSDK } from '../sdk/FaceTecSDK'
import { ExceptionType, kindOfSessionIssue } from '../utils/kindOfTheIssue'
import { hideRedBox, hideRedBoxIfNonCritical } from '../utils/redBox'
import { MAX_RETRIES_ALLOWED, resultSuccessMessage } from '../sdk/FaceTecSDK.constants'
import usePropsRefs from '../../../lib/hooks/usePropsRefs'

const log = logger.child({ from: 'useFaceTecVerification' })
const emptyBase64 = btoa(String.fromCharCode(0x20).repeat(40))

/**
 * FaceTecSDK face verification & fecamap enrollment hook
 *
 * @param {object} config Configuration
 * @property {string} config.enrollmentIdentifier Unique identifier string used for identify enrollment
 * @property {(lastMessage: string) => void} config.onSuccess Verification completion callback
 * @property @param {string} config.onSuccess.lastMessage Last status message (got from session status, server response or error thrown)
 * @property {(error: Error) => void} config.onError - Verification error callback
 *
 * @return {async () => Promise<void>} Function that starts verification/enrollment process
 */
export default (options = null) => {
  const {
    enrollmentIdentifier,
    chainId = null,
    fvSigner = null,
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
  const refs = usePropsRefs([onUIReady, onCaptureDone, onRetry, onComplete, onError, maxRetries])

  // Starts verification/enrollment process
  // Wrapped to useCallback for encapsulate session in a single call
  // and execute corresponding callback on completion or error
  const startVerification = useCallback(async () => {
    // destructuring accessors keeping theirs names the
    // same like in the props for avoid code modifications
    const [onUIReady, onCaptureDone, onRetry, onComplete, onError, getMaxRetries] = refs
    const isDeviceEmulated = await isEmulator

    // if cypress is running
    // isMobileNative is temporary check, will be removed once we'll deal with Zoom on native
    if (isDeviceEmulated) {
      log.debug('skipping fv ui for non real devices or IOS', { isDeviceEmulated })

      try {
        // don't start session, just call enroll with fake data to whitelist user on server
        // btw we need a real session id, so we're calling Zoom API for it (bugfix by @sirpy)
        const sessionId = await api.issueSessionToken()

        await api.performFaceVerification(enrollmentIdentifier, {
          fvSigner,
          chainId,
          sessionId,
          faceScan: emptyBase64,
          auditTrailImage: emptyBase64,
          lowQualityAuditTrailImage: emptyBase64,
        })
      } catch (exception) {
        const { message } = exception

        hideRedBox(exception, () => log.error('Zoom verification failed', message, exception, { dialogShown: false }))
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

    // preparing verification options object
    const maxRetries = getMaxRetries()
    const verificationOptions = { onUIReady, onCaptureDone, onRetry, maxRetries }

    // setting session is running flag in the ref
    sessionInProgressRef.current = true

    log.debug('Starting Zoom verification', { enrollmentIdentifier, chainId, verificationOptions })

    // initializing zoom session
    try {
      const verificationStatus = await FaceTecSDK.faceVerification(enrollmentIdentifier, chainId, verificationOptions)

      log.debug('Zoom verification successful', { verificationStatus })
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
      hideRedBoxIfNonCritical(exception, () =>
        log.error('Zoom verification failed', message, exception, { dialogShown }),
      )

      onError(exception)
    } finally {
      // setting session is not running flag in the ref
      sessionInProgressRef.current = false
    }
  }, [enrollmentIdentifier, chainId, refs])

  // exposing public hook API
  return startVerification
}
