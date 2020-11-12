import { assign, first, isFinite, isNumber } from 'lodash'

import api from '../api/FaceVerificationApi'
import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import { UITextStrings } from './UICustomization'
import { MAX_RETRIES_ALLOWED } from './ZoomSDK.constants'

const {
  // Zoom verification session incapsulation
  ZoomSession,

  // Zoom session status codes enum
  ZoomSessionStatus,

  // Helper function, returns full description
  // for session status specified
  getFriendlyDescriptionForZoomSessionStatus,

  // Helper class, allows to customize Zoom UI
  ZoomCustomization,
} = ZoomAuthentication.ZoomSDK

// enrollment processor class
// former startVerification from the useZoomVerification hook simply translated to the class
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
  handleCompletion() {
    const { subscriber, isSuccess, lastMessage, lastResult } = this
    let latestMessage = lastMessage
    const { status } = lastResult

    // if no errors were thrown and server haven't returned specific status messages
    if (!latestMessage) {
      // setting last message from session status code it it's present
      latestMessage =
        isNumber(status) && status !== ZoomSessionStatus.SessionCompletedSuccessfully
          ? getFriendlyDescriptionForZoomSessionStatus(status)
          : 'Session could not be completed due to an unexpected issue during the network request.'
    }

    // calling completion callback
    subscriber.onSessionCompleted(isSuccess, lastResult, latestMessage)
  }

  /**
   * Helper method that calls verification http API on server
   */
  async performVerification() {
    // reading current session state vars
    const { lastResult, resultCallback, enrollmentIdentifier, subscriber, retryAttempt, maxRetries } = this

    // setting initial progress to 0 for freeze progress bar
    resultCallback.uploadProgress(0)

    // getting images captured
    const { faceMetrics, sessionId } = lastResult
    const captured = faceMetrics.lowQualityAuditTrailCompressedBase64()
    const capturedHD = faceMetrics.getAuditTrailBase64JPG()

    try {
      // preparing face map
      const faceMap = await this._getFaceMapBase64()

      // preparing request payload
      const payload = {
        sessionId,
        faceMap,
        enrollmentIdentifier,
        lowQualityAuditTrailImage: first(captured),
        auditTrailImage: first(capturedHD),
      }

      // after some preparation notifying Zoom that progress is 10%
      resultCallback.uploadProgress(0.1)

      // calling API, if response contains success:false it will throw an exception
      await api
        .performFaceVerification(payload, ({ loaded, total }) => {
          // handling XMLHttpRequest upload progress from 10 to 80%
          resultCallback.uploadProgress(0.1 + (0.7 * loaded) / total)
        })
        .finally(() => {
          // last 20% progress bar will stuck in 'almost completed' state
          // white GoodServer will process uploaded FaceMap
          resultCallback.uploadProgress(1)
        })

      // if enrolled sucessfully - setting last message from server response
      const { zoomResultSuccessMessage } = UITextStrings

      ZoomCustomization.setOverrideResultScreenSuccessMessage(zoomResultSuccessMessage)

      // updating session state vars
      this.isSuccess = true
      this.lastMessage = zoomResultSuccessMessage

      // marking session as successfull
      resultCallback.succeed()
    } catch (exception) {
      // if call failed - reading http response from exception object
      const { message, response } = exception

      // by default we'll use exception's message as lastMessage
      this.lastMessage = message

      if (response) {
        // if error response was sent
        const { enrollmentResult, error } = response
        const { isEnrolled, isLive, isDuplicate, code, subCode } = enrollmentResult || {}

        // if isDuplicate is strictly true, that means we have dup face
        // despite the http status code this case should be processed like error
        const isDuplicateIssue = true === isDuplicate

        /* eslint-disable lines-around-comment */

        // checking if exception could be related to the liveness failure
        // there's two possible cases:
        //  a) if code is 200 then facetec server operations went ok but
        //     there could be issues with liveness check or image quality
        //  b) if server returns subCode = livenessCheckFailed (v8 only) it's
        //     exactly a liveness check issue
        const isLivenessIssue =
          (200 === code || 'livenessCheckFailed' === subCode) &&
          // checking liveness / enrollment statuses flags
          // if liveness check failed or face wasn't enrolled by the other reasons
          // (e.g. wearing glasses or bad image quality)
          (false === isLive || false === isEnrolled)

        /* eslint-enable lines-around-comment */

        // setting lastMessage from server's response
        this.lastMessage = error

        // if there's no duplicate issues but we have liveness issue strictly
        // we'll check for possible session retry
        if (!isDuplicateIssue && isLivenessIssue) {
          const alwaysRetry = !isFinite(maxRetries) || maxRetries < 0

          // if haven't reached retries threshold or max retries is disabled
          // (is null or < 0) we'll ask to retry capturing
          if (alwaysRetry || retryAttempt < maxRetries) {
            // increasing retry attempts counter
            this.retryAttempt = retryAttempt + 1

            // showing reason
            ZoomCustomization.setOverrideResultScreenSuccessMessage(error)

            // notifying about retry
            resultCallback.retry()

            subscriber.onRetry({
              exception,
              reason: error,
              liveness: isLive,
              enrolled: isEnrolled,
            })

            return
          }
        }
      }

      // the other cases (non-200 code or other issue that liveness / image quality)
      // we're processing like an error - cancelling session
      // this will trigger handleCompletion which in turn trigger ProcessingSubscriber.onSessionCompleted
      // which then rejects its promise and causes ZoomSDK.faceVerification to throw which is caught by
      // useZoomVerification
      resultCallback.cancel()
    }
  }

  /**
   * Zoom processor contract method. Calls by Zoom on some events (e.g. images were captured,
   * server call was completed etc). Allows to perform server call ot specify what
   * Zoom should do after server response returned (cancel / retry / succeed session)
   *
   * @see ZoomSDK.ZoomFaceMapProcessor
   * @private
   */
  processZoomSessionResultWhileZoomWaits(zoomSessionResult, zoomFaceMapResultCallback) {
    const { subscriber } = this
    const { status, faceMetrics } = zoomSessionResult
    const { faceMap } = faceMetrics

    // updating session state variables
    this.lastResult = zoomSessionResult
    this.resultCallback = zoomFaceMapResultCallback

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

    // if no session in progress - notifying that caturing is done
    subscriber.onCaptureDone()

    // and performing http server call
    this.performVerification()
  }

  /**
   * generates session ID and starts session
   * enroll call proxioes here - just for keep non-async
   * interface with onComplete callback designed by Zoom
   * @private
   */
  async _startEnrollmentSession() {
    const { subscriber } = this

    try {
      // trying to retrieve session ID from Zoom server
      const sessionId = await api.issueSessionToken()

      // if we've got it - strting enrollment session
      new ZoomSession(() => this.handleCompletion(), this, sessionId)

      // notifying subscriber that UI is ready
      subscriber.onUIReady()
    } catch ({ message }) {
      // otherwise calling completion handler with empty zoomSessionResult
      subscriber.onSessionCompleted(false, null, message)
    }
  }

  /**
   * Promisified getFaceMapBase64.getFaceMapBase64()
   *
   * @private
   */
  // eslint-disable-next-line require-await
  async _getFaceMapBase64() {
    const { faceMetrics } = this.lastResult

    return new Promise((resolve, reject) =>
      faceMetrics.getFaceMapBase64(faceMap =>
        faceMap ? resolve(faceMap) : reject(new Error('Error generating FaceMap !')),
      ),
    )
  }
}
