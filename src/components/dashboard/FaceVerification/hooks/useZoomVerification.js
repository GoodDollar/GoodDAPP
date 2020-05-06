import { useCallback, useRef, useState } from 'react'
import { first, noop } from 'lodash'

import api from '../api'
import UserStorage from '../../../../lib/gundb/UserStorage'
import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import useMountedState from '../../../../lib/hooks/useMountedState'

// Zoom SDK reference
const { ZoomSDK } = ZoomAuthentication

// ZoomSession incapsulation & helper classes / functions
const { ZoomSession, ZoomCustomization } = ZoomSDK

export const {
  // Zoom session status codes enum
  ZoomSessionStatus,

  // Helper function, returns full description
  // for session status specified
  getFriendlyDescriptionForZoomSessionStatus,
} = ZoomSDK

// Session state shape
const initialSessionState = {
  /**
   * Completion flag
   *
   * @property {boolean} isComplete
   */
  isComplete: false,

  /**
   * Successfull enrollment flag
   *
   * @property {boolean} isSuccess
   */
  isSuccess: false,

  /**
   * Latest session result object
   *
   * @property {ZoomSDK.ZoomSessionResult} lastResult
   */
  lastResult: null,

  /**
   * Last status message (got from session status, server response or error thrown)
   * @property {string} lastMessage
   */
  lastMessage: null,
}

/**
 * ZoomSDK face verification & fecamap enrollment hook
 *
 * @param {object} config Configuration
 * @property {(isSuccess: boolean, lastResult: ZoomSDK.ZoomSessionResult, lastMessage: string) => void}
 * config.onComplete - Verification completion callback @see initialSessionState
 * @property {(error: Error) => void} config.onError - Verfifcication error callback
 *
 * @return {object} result Public hook API
 * @property {async () => Promise<void>} result.startVerification - Function
 * that starts verification/enrollment process
 * @property {boolean} result.isComplete @see initialSessionState
 * @property {boolean} result.isSuccess @see initialSessionState
 * @property {ZoomSDK.ZoomSessionResult} result.lastResult @see initialSessionState
 * @property {string} result.lastMessage @see initialSessionState
 */
export default ({ onComplete = noop, onError = noop }) => {
  // Zoom session ref. Shared via Refs to avoid begin
  // a new session until current is in progress
  const sessionRef = useRef(null)

  // Component mounted flag ref, it needs to check
  // is component still mounted before update it's state
  // This check is needed as onInitialized/onError could
  // perform redirects which unmounts component
  const mountedStateRef = useMountedState()

  // Zoom session state
  const [sessionState, setSessionState] = useState(initialSessionState)

  // Starts verification/enrollment process
  // Wrapped to useCallback with all verification stuff
  // (callbacks, helpers, status/result closures)
  // for incapsulate session in a single call and avoid
  // cases when we receive empty session result
  // (due to the hook-specific closue access issues)
  // which forces us to cancel session
  // Actually this case should happens only in server call timeout
  const startVerification = useCallback(() => {
    // don't starting new session if it already runs
    if (sessionRef.current) {
      return
    }

    // session state closures
    let isSuccess = false
    let lastResult = null
    let lastMessage = null
    let resultCallback = null

    // Helper for handle session completion
    const handleCompletion = () => {
      const { status } = lastResult

      // if no errors were thrown and server haven't returned specific
      // status messages - setting last message from session status code
      if (!lastMessage) {
        lastMessage = getFriendlyDescriptionForZoomSessionStatus(status)
      }

      // cleaning session is running flag
      sessionRef.current = null

      // calling completion callback
      onComplete(isSuccess, lastResult, lastMessage)

      if (!mountedStateRef.current) {
        return
      }

      // is component is still mounted (no redirects were performed
      // in the completion callback) - updating session state
      setSessionState({
        isComplete: true,
        isSuccess,
        lastResult,
        lastMessage,
      })
    }

    // Promisified getFaceMapBase64.getFaceMapBase64()
    // eslint-disable-next-line require-await
    const getFaceMapBase64 = async () =>
      new Promise((resolve, reject) => {
        const { faceMetrics } = lastResult

        faceMetrics.getFaceMapBase64(faceMap =>
          faceMap ? resolve(faceMap) : reject(new Error('Error generating FaceMap !'))
        )
      })

    // Helper that calls verification http API on server
    const performVerification = async () => {
      // reading current session state vars
      const zoomSessionResult = lastResult
      const zoomFaceMapResultCallback = resultCallback

      // setting initial progress to 0 for freeze progress bar
      zoomFaceMapResultCallback.uploadProgress(0)

      // getting images captured
      const { faceMetrics, sessionId } = zoomSessionResult
      const captured = faceMetrics.lowQualityAuditTrailCompressedBase64()
      const capturedHD = faceMetrics.getAuditTrailBase64JPG()
      const enrollmentIdentifier = UserStorage.getFaceIdentifier()

      try {
        // preparing face map
        const faceMap = await getFaceMapBase64()

        // preparing request payload
        const payload = {
          sessionId,
          faceMap,
          enrollmentIdentifier,
          lowQualityAuditTrailImage: first(captured),
          auditTrailImage: first(capturedHD),
        }

        // after some preparation notifying Zoom that progress is 10%
        zoomFaceMapResultCallback.uploadProgress(0.1)

        // calling API
        const response = await api.performFaceVerification(payload, ({ loaded, total }) => {
          // handling XMLHttpRequest upload progress from 10 to 80%
          zoomFaceMapResultCallback.uploadProgress(0.1 + (0.7 * loaded) / total)
        })

        // last 20% progress bar will stuck in 'almost completed' state
        // white GoodServer will process uploaded FaceMao
        zoomFaceMapResultCallback.uploadProgress(1)

        // if enrolled sucessfully - setting last message from server response
        const { message: successMessage } = response.enrollmentResult

        ZoomCustomization.setOverrideResultScreenSuccessMessage(successMessage)

        // updating session state vars
        isSuccess = true
        lastMessage = successMessage

        // marking session as successfull
        zoomFaceMapResultCallback.succeed()
      } catch (exception) {
        zoomFaceMapResultCallback.uploadProgress(1)

        // if call failed - reading http response from exception object
        const { message, response } = exception

        // by default we'll use exception's message as lastMessage
        lastMessage = message

        if (response) {
          // if error response was sent
          const { isEnrolled, isLive, code, message: zoomMessage } = response.enrollmentResult || {}

          // setting lastMessage from server's response
          lastMessage = zoomMessage

          // if code is 200 then we have some client-side issues
          // (e.g. low images quality, glasses weared, too dark etc)
          if (200 === code && (!isLive || !isEnrolled)) {
            // showing reason and asking to retry capturing
            ZoomCustomization.setOverrideResultScreenSuccessMessage(lastMessage)

            zoomFaceMapResultCallback.retry()
            return
          }
        }

        // otherwise (no response or code isn't 200) we're cancelling session
        exception.code = lastResult.status
        zoomFaceMapResultCallback.cancel(lastMessage)

        // and if component is still mounted (.cancel() calls completion
        // handler too with isSucess = false which could perform redirects)
        if (mountedStateRef.current) {
          // updating session state with exception
          onError(exception)
        }
      }
    }

    // Zoom processor function. Calls by Zoom on some events (e.g. images were captured,
    // server call was completed etc). Allows to perform server call ot specify what
    // Zoom should do after server response returned (cancel / retry / succeed session)
    // @see ZoomSDK.ZoomFaceMapProcessor
    const processZoomSessionResultWhileZoomWaits = (zoomSessionResult, zoomFaceMapResultCallback) => {
      const { status, faceMetrics } = zoomSessionResult
      const { faceMap } = faceMetrics

      // updating session state closures
      lastResult = zoomSessionResult
      resultCallback = zoomFaceMapResultCallback

      // checking the following cases
      // 1. Processor is called but session is still in progress. That means we've reached timeout
      // 2. New data (probably with better quality) came while session calling server.
      if (status !== ZoomSessionStatus.SessionCompletedSuccessfully || !faceMap || !faceMap.size) {
        // on both cases described above we're cancelling current XMLHttpRequests
        // then cancelling current session
        api.cancelInFlightRequests()
        zoomFaceMapResultCallback.cancel()
        return
      }

      // if no session in progress - performing http server call
      performVerification()
    }

    // initializing zoom session, passing session processor and storing current session in the ref
    sessionRef.current = new ZoomSession(handleCompletion, { processZoomSessionResultWhileZoomWaits })
  }, [onComplete, onError, setSessionState])

  // exposing public hook API
  return {
    startVerification,
    ...sessionState,
  }
}
