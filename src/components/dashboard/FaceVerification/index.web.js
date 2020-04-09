import { useCallback } from 'react'
import { findKey } from 'lodash'

import useZoomSDK, { ZoomSDKStatus } from './hooks/useZoomSDK'
import useZoomVerification, { ZoomSessionStatus } from './hooks/useZoomVerification'

const kindOfCameraIssuesMap = mapValues({
  // All Zoom session result codes could be thrown if the
  // camera isn't available or no camera access was confirmed
  // in this case we're marking error as 'NotAllowedError'.
  'NotAllowedError': [
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
  ],

  // All Zoom sdk and session result codes could be thrown if device
  // orientation isn't portrait or was changed during the session
  // in this case we're marking error as 'DeviceOrientationError'.
  'DeviceOrientationError': [
    // device orientation was changed during the ZoOm Session
    'OrientationChangeDuringSession',

    // device is in landscape mode
    'LandscapeModeNotAllowed'
  ]
}, sessionStatus => ZoomSessionStatus[sessionStatus])

const FaceVerification = ({ screenProps }) => {
  // Redirects to the error screen, passing exception
  // object and allowing to show/hide retry button (hides it by default)
  const showErrorScreen = useCallback(
    (error, allowRetry = false) => {
      screenProps.navigateTo('FaceVerificationError', { error, allowRetry })
    },
    [screenProps]
  )

  // ZoomSDK session completition handler
  const completionHandler = useCallback(
    (isSuccess, { status }, lastMessage) => {
      // preparing error object
      const exception = new Error(lastMessage)

      // if session was successfull - returning sucess to the caller
      if (isSuccess) {
        screenProps.pop({ isValid: true })
        return
      }

      // the following code is needed for ErrorScreen component
      // could display specific error message corresponding to
      // the kind of issue (camera, orientation etc)
      const errorName = findKey(
        kindOfCameraIssuesMap,
        statusCodes => statusCodes.includes(status)
      )

      if (errorName) {
        exception.name = errorName
      }

      // handling error
      showErrorScreen(exception, true)
    },
    [screenProps, showErrorScreen]
  )

  // ZoomSDK initialization error handler
  const sdkExceptionHandler = useCallback(exception => {
    // the following code is needed for ErrorScreen component
    // could display specific error message corresponding to
    // the kind of issue (camera, orientation etc)
    if (ZoomSDKStatus.DeviceInLandscapeMode === exception.code) {
      exception.name = 'DeviceOrientationError'
    }

    // handling error
    showErrorScreen(exception, false)
  }, [showErrorScreen])

  // Using zoom verification hook, passing completion callback
  const { startVerification } = useZoomVerification({
    onComplete: completionHandler,
  })

  // using zoom sdk initialization hook
  // starting verification once sdk sucessfully initializes
  // on error redirecting to the error screen
  useZoomSDK({
    onInitialized: startVerification,
    onError: sdkExceptionHandler,
  })

  return null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
