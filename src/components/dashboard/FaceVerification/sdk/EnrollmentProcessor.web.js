import { assign, first, isFinite, isNumber } from 'lodash'

import api from '../api/FaceVerificationApi'
import FaceTec from '../../../../lib/facetec/FaceTecSDK'
import { UITextStrings } from './UICustomization'
import { MAX_RETRIES_ALLOWED, resultFacescanProcessingMessage } from './FaceTecSDK.constants'

const {
  // Zoom verification session incapsulation
  FaceTecSession,

  // Zoom session status codes enum
  FaceTecSessionStatus,

  // Helper function, returns full description
  // for session status specified
  getFriendlyDescriptionForFaceTecSessionStatus,

  // Helper class, allows to customize Zoom UI
  FaceTecCustomization,
} = FaceTec.FaceTecSDK

// enrollment processor class
// former startVerification from the useFaceTecVerification hook simply translated to the class
// all closures vars now are instance vars, all functions are methods
export class EnrollmentProcessor {
  // session state variables
  isSuccess = false

  lastResult = null

  lastMessage = null

  enrollmentIdentifier = null

  resultCallback = null

  retryAttempt = 0

  constructor(subscriber, options = null) {
    const { maxRetries = MAX_RETRIES_ALLOWED } = options || {}

    assign(this, { subscriber, maxRetries })
  }

  // should be non-async for not confuse developers
  // By Zoom's design, EnrollmentProcessor should return
  // session result only via callbacks / subscriptions
  enroll(enrollmentIdentifier) {
    this.enrollmentIdentifier = enrollmentIdentifier

    // so we're just proxying call to the async _startEnrollmentSession
    this._startEnrollmentSession()
  }

  /**
   * Helper method for handle session completion
   */
  onFaceTecSDKCompletelyDone() {
    const { subscriber, isSuccess, lastMessage, lastResult } = this
    const { status } = lastResult || {}
    let latestMessage = lastMessage

    // if no errors were thrown and server haven't returned specific status messages
    if (!latestMessage) {
      // setting last message from session status code it it's present
      latestMessage =
        isNumber(status) && status !== FaceTecSessionStatus.SessionCompletedSuccessfully
          ? getFriendlyDescriptionForFaceTecSessionStatus(status)
          : 'Session could not be completed due to an unexpected issue during the network request.'
    }

    // calling completion callback
    subscriber.onSessionCompleted(isSuccess, lastResult, latestMessage)
  }

  /**
   * Helper method that calls verification http API on server
   */
  async sendEnrollmentRequest() {
    // reading current session state vars
    const { lastResult, resultCallback, enrollmentIdentifier } = this

    // setting initial progress to 0 for freeze progress bar
    resultCallback.uploadProgress(0)

    // getting images captured
    const { faceScan, auditTrail, lowQualityAuditTrail, sessionId } = lastResult

    try {
      // preparing request payload
      const payload = {
        faceScan,
        sessionId,
        lowQualityAuditTrailImage: first(lowQualityAuditTrail),
        auditTrailImage: first(auditTrail),
      }

      // after some preparation notifying Zoom that progress is 10%
      resultCallback.uploadProgress(0.1)

      // calling API, if response contains success:false it will throw an exception
      await api
        .performFaceVerification(enrollmentIdentifier, payload, ({ loaded, total }) => {
          const uploaded = loaded / total

          if (uploaded >= 1) {
            // switch status message to processing once upload completed
            resultCallback.uploadMessageOverride(resultFacescanProcessingMessage)
          }

          // handling XMLHttpRequest upload progress from 10 to 80%
          resultCallback.uploadProgress(0.1 + 0.7 * uploaded)
        })
        .finally(() => {
          // last 20% progress bar will stuck in 'almost completed' state
          // white GoodServer will process uploaded FaceMap
          resultCallback.uploadProgress(1)
        })

      // if enrolled sucessfully - setting last message from server response
      const { resultSuccessMessage } = UITextStrings

      FaceTecCustomization.setOverrideResultScreenSuccessMessage(resultSuccessMessage)

      // updating session state vars
      this.isSuccess = true
      this.lastMessage = resultSuccessMessage

      // marking session as successfull
      resultCallback.succeed()
    } catch (exception) {
      this.handleEnrollmentError(exception)
    }
  }

  /**
   * @private
   */
  handleEnrollmentError(exception) {
    const { resultCallback, subscriber, retryAttempt, maxRetries } = this

    // if call failed - reading http response from exception object
    const { message, response } = exception

    // setting lastMessage from exception's message
    // if response was sent - it will contain message from server
    this.lastMessage = message

    if (response) {
      // if error response was sent
      const { enrollmentResult, error } = response
      const { isEnrolled, isLive, isDuplicate, isNotMatch } = enrollmentResult || {}

      // if isDuplicate is strictly true, that means we have dup face
      // despite the http status code this case should be processed like error
      const isDuplicateIssue = true === isDuplicate
      const is3DMatchIssue = true === isNotMatch
      const isLivenessIssue = false === isLive

      // if there's no duplicate / 3d match issues but we have
      // liveness issue strictly - we'll check for possible session retry
      if (!isDuplicateIssue && !is3DMatchIssue && isLivenessIssue) {
        const alwaysRetry = !isFinite(maxRetries) || maxRetries < 0

        // if haven't reached retries threshold or max retries is disabled
        // (is null or < 0) we'll ask to retry capturing
        if (alwaysRetry || retryAttempt < maxRetries) {
          // increasing retry attempts counter
          this.retryAttempt = retryAttempt + 1

          // showing reason
          resultCallback.uploadMessageOverride(error)

          // notifying about retry
          resultCallback.retry()

          subscriber.onRetry({
            reason: exception,
            match3d: !is3DMatchIssue,
            liveness: !isLivenessIssue,
            duplicate: isDuplicateIssue,
            enrolled: true === isEnrolled,
          })

          return
        }
      }
    }

    // the other cases (non-200 code or other issue that liveness / image quality)
    // we're processing like an error - cancelling session
    // this will trigger handleCompletion which in turn trigger ProcessingSubscriber.onSessionCompleted
    // which then rejects its promise and causes FaceTecSDK.faceVerification to throw which is caught by
    // useFaceTecVerification
    resultCallback.cancel()
  }

  /**
   * Zoom processor contract method. Calls by Zoom on some events (e.g. images were captured,
   * server call was completed etc). Allows to perform server call ot specify what
   * Zoom should do after server response returned (cancel / retry / succeed session)
   *
   * @see FaceTecSDK.ZoomFaceMapProcessor
   * @private
   */
  processSessionResultWhileFaceTecSDKWaits(sessionResult, faceScanResultCallback) {
    const { subscriber } = this

    // updating session state variables
    this.lastResult = sessionResult
    this.resultCallback = faceScanResultCallback

    // checking the following cases
    // 1. Processor is called but session is still in progress. That means we've reached timeout
    // 2. New data (probably with better quality) came while session calling server.
    if (sessionResult.status !== FaceTecSessionStatus.SessionCompletedSuccessfully) {
      // on both cases described above we're cancelling current XMLHttpRequests
      // then cancelling current session
      api.cancelInFlightRequests()
      faceScanResultCallback.cancel()
      return
    }

    // if no session in progress - notifying that caturing is done
    subscriber.onCaptureDone()

    // and performing http server call
    this.sendEnrollmentRequest()
  }

  /**
   * generates session ID and starts session
   * enroll call proxies here - just for keep non-async
   * interface with onComplete callback designed by Zoom
   * @private
   */
  async _startEnrollmentSession() {
    const { subscriber } = this

    try {
      // trying to retrieve session ID from Zoom server
      const sessionId = await api.issueSessionToken()

      // if we've got session ID - starting enrollment session
      new FaceTecSession(this, sessionId)

      // notifying subscriber that UI is ready
      subscriber.onUIReady()
    } catch ({ message }) {
      // otherwise calling completion handler with empty faceTecSessionResult
      subscriber.onSessionCompleted(false, null, message)
    }
  }
}
