import { useCallback } from 'react'
import { pick } from 'lodash'

import useZoomSDK from './hooks/useZoomSDK'
import useZoomVerification, { ZoomSessionStatus } from './hooks/useZoomVerification'

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
  const showErrorScreen = useCallback(
    (error, allowRetry = false) => {
      screenProps.navigateTo('FaceVerificationError', { error, allowRetry })
    },
    [screenProps]
  )

  const completionHandler = useCallback(
    (isSuccess, { status }, lastMessage) => {
      const exception = new Error(lastMessage)

      if (isSuccess) {
        screenProps.navigateTo('Home')
        return
      }

      if (cameraIssuesStatusCodes.includes(status)) {
        exception.name = 'NotAllowedError'
      }

      showErrorScreen(exception, true)
    },
    [screenProps, showErrorScreen]
  )

  const { startVerification } = useZoomVerification({
    onComplete: completionHandler,
  })

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
