import { useCallback } from 'react'
import { pick } from 'lodash'

import useZoomSDK from './hooks/useZoomSDK'
import useZoomVerification, { ZoomSessionStatus } from './hooks/useZoomVerification'

// All Zoom session result codes could be thrown if the
// camera isn't available or no camera access was confirmed
const cameraIssuesStatusCodes = Object.values(
  pick(
    ZoomSessionStatus,

    // camera permissions wasn't given
    'UserCancelledWhenAttemptingToGetCameraPermissions',

    // no camera available.
    'CameraDoesNotExist',

    // camera was not enabled.
    'CameraNotEnabled',

    // selected camera is not active
    'CameraNotRunning',

    // camera is busy because another ZoOm Session in progress.
    'ZoomSessionInProgress',

    // video initialization issues
    'UnmanagedSessionVideoInitializationNotCompleted',
    'VideoHeightOrWidthZeroOrUninitialized',
    'VideoCaptureStreamNotActive'
  )
)

const FaceVerification = ({ screenProps }) => {
  // Redirects to the error screen, passing exception
  // object and allowing to show/hide retry button (hides it by default)
  const showErrorScreen = useCallback(
    (error, allowRetry = false) => {
      screenProps.navigateTo('FaceVerificationError', { error, allowRetry })
    },
    [screenProps]
  )

  /**
   * ZoomSDK session completition handler
   * @param {boolean} isSuccess
   * @param {ZoomSDK.ZoomSessionResult} Session result object
   * @param {string} lastMessage Full description of the last
   * session status or success/error message got from server
   */
  const completionHandler = useCallback(
    (isSuccess, { status }, lastMessage) => {
      // preparing error object
      const exception = new Error(lastMessage)

      // if session was successfull - returning sucess to the caller
      if (isSuccess) {
        screenProps.navigateTo('Home')
        return
      }

      // if error was caused by the camera issues - marking
      // error as 'NotAllowedError'. It's needed for ErrorScreen
      // component could display that something is wrong with the camera
      if (cameraIssuesStatusCodes.includes(status)) {
        exception.name = 'NotAllowedError'
      }

      // handling error
      showErrorScreen(exception, true)
    },
    [screenProps, showErrorScreen]
  )

  // Using zoom verification hook, passing completion callback
  const { startVerification } = useZoomVerification({
    onComplete: completionHandler,
  })

  // using zoom sdk initialization hook
  // starting verification once sdk sucessfully initializes
  // on error redirecting to the error screen
  useZoomSDK({
    onInitialized: startVerification,
    onError: showErrorScreen,
  })

  return null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
