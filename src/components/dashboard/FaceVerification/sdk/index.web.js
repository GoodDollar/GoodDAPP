import { first } from 'lodash'

import api from '../api'
import ZoomAuthentication from '../../../../lib/zoom/ZoomAuthentication'
import UserStorage from '../../../../lib/gundb/UserStorage'

// Zoom SDK reference
const { ZoomSDK: sdk } = ZoomAuthentication

export const {
  // SDK initialization status codes enum
  ZoomSDKStatus,

  // Zoom session status codes enum
  ZoomSessionStatus,
} = sdk

const {
  // Zoom prelaod result codes enum
  ZoomPreloadResult,

  // Helper function, returns full description
  // for SDK initialization status specified
  getFriendlyDescriptionForZoomSDKStatus,

  // Helper function, returns full description
  // for session status specified
  getFriendlyDescriptionForZoomSessionStatus,

  // Zoom verification session incapsulation
  ZoomSession,

  // Helper class, allows to customize Zoom UI
  ZoomCustomization,
} = sdk

// enrollment processor class
// former startVerification from the useZoomVerification hook simply translated to the class
// all closures vars now are instance vars, all functions are methods
class EnrollmentProcessor {
  // session state variables
  isSuccess = false

  lastResult = null

  lastMessage = null

  resultCallback = null

  constructor(onSessionCompleted = (isSuccess, lastResult, lastMessage) => {}) {
    this.onSessionCompleted = onSessionCompleted
  }

  // Helper method for handle session completion
  handleCompletion() {
    const { onSessionCompleted, isSuccess, lastMessage, lastResult } = this
    let latestMessage = lastMessage
    const { status } = lastResult

    // if no errors were thrown and server haven't returned specific
    // status messages - setting last message from session status code
    if (!latestMessage) {
      latestMessage = getFriendlyDescriptionForZoomSessionStatus(status)
    }

    // calling completion callback
    onSessionCompleted(isSuccess, lastResult, latestMessage)
  }

  // Promisified getFaceMapBase64.getFaceMapBase64()
  // eslint-disable-next-line require-await
  async getFaceMapBase64() {
    const { faceMetrics } = this.lastResult

    return new Promise((resolve, reject) =>
      faceMetrics.getFaceMapBase64(faceMap =>
        faceMap ? resolve(faceMap) : reject(new Error('Error generating FaceMap !'))
      )
    )
  }

  // Helper method that calls verification http API on server
  async performVerification() {
    // reading current session state vars
    const { lastResult, resultCallback } = this

    // setting initial progress to 0 for freeze progress bar
    resultCallback.uploadProgress(0)

    // getting images captured
    const { faceMetrics, sessionId } = lastResult
    const captured = faceMetrics.lowQualityAuditTrailCompressedBase64()
    const capturedHD = faceMetrics.getAuditTrailBase64JPG()
    const enrollmentIdentifier = UserStorage.getFaceIdentifier()

    try {
      // preparing face map
      const faceMap = await this.getFaceMapBase64()

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

      // calling API
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
      const successMessage = 'The FaceMap was successfully enrolled.'

      ZoomCustomization.setOverrideResultScreenSuccessMessage(successMessage)

      // updating session state vars
      this.isSuccess = true
      this.lastMessage = successMessage

      // marking session as successfull
      resultCallback.succeed()
    } catch (exception) {
      // if call failed - reading http response from exception object
      const { message, response } = exception

      // by default we'll use exception's message as lastMessage
      this.lastMessage = message

      if (response) {
        // if error response was sent
        const { isEnrolled, isLive, code, message: zoomMessage } = response.enrollmentResult || {}

        // setting lastMessage from server's response
        this.lastMessage = zoomMessage

        // if code is 200 then we have some client-side issues
        // (e.g. low images quality, glasses weared, too dark etc)
        if (200 === code && (!isLive || !isEnrolled)) {
          // showing reason and asking to retry capturing
          ZoomCustomization.setOverrideResultScreenSuccessMessage(zoomMessage)

          resultCallback.retry()
          return
        }
      }

      // otherwise we're cancelling session
      resultCallback.cancel()
    }
  }

  // Zoom processor contract method. Calls by Zoom on some events (e.g. images were captured,
  // server call was completed etc). Allows to perform server call ot specify what
  // Zoom should do after server response returned (cancel / retry / succeed session)
  // @see ZoomSDK.ZoomFaceMapProcessor
  processZoomSessionResultWhileZoomWaits(zoomSessionResult, zoomFaceMapResultCallback) {
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

    // if no session in progress - performing http server call
    this.performVerification()
  }
}

// sdk class
export const ZoomSDK = new class {
  async preload() {
    // setting a the directory path for other ZoOm Resources.
    sdk.setResourceDirectory('/zoom/resources')

    // setting the directory path for required ZoOm images.
    sdk.setImagesDirectory('/zoom/images')

    await new Promise(
      (resolve, reject) =>
        void sdk.preload(status => {
          if (status === ZoomPreloadResult.Success) {
            resolve()
            return
          }

          const exception = new Error(`Couldn't preload Zoom SDK`)

          exception.code = status
          reject(exception)
        })
    )
  }

  // eslint-disable-next-line require-await
  async initialize(licenseKey) {
    // checking the last retrieved status code
    // if Zoom was already initialized successfully,
    // then resolving immediately
    if (ZoomSDKStatus.Initialized === sdk.getStatus()) {
      return
    }

    return new Promise((resolve, reject) => {
      try {
        // initializing ZoOm and configuring the UI features.
        sdk.initialize(licenseKey, () => {
          const sdkStatus = sdk.getStatus()

          // if Zoom was initialized successfully - resolving
          if (ZoomSDKStatus.Initialized === sdkStatus) {
            resolve()
            return
          }

          // retrieving full description from status code
          const exception = new Error(getFriendlyDescriptionForZoomSDKStatus(sdkStatus))

          // adding status code as error's object property
          exception.code = sdkStatus

          // rejecting with an error
          reject(exception)
        })
      } catch (exception) {
        // handling initialization exceptions
        // (some of them could be thrown during initialize() call)
        reject(exception)
      }
    })
  }

  // eslint-disable-next-line require-await
  async faceVerification() {
    return new Promise((resolve, reject) => {
      // as now all this stuff is outside React hook
      // we could just implement it like in the demo app
      const processor = new EnrollmentProcessor((isSuccess, lastResult, lastMessage) => {
        if (isSuccess) {
          resolve(lastMessage)
        }

        const exception = new Error(lastMessage)

        exception.code = lastResult.status
        reject(exception)
      })

      new ZoomSession(() => processor.handleCompletion(), processor)
    })
  }
}()
