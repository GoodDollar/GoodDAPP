import { useCallback } from 'react'
import { findKey, mapValues } from 'lodash'

import goodWallet from '../../../lib/wallet/GoodWallet'
import GDStore from '../../../lib/undux/GDStore'
import useZoomSDK, { ZoomSDKStatus } from './hooks/useZoomSDK'
import useZoomVerification, { ZoomSessionStatus } from './hooks/useZoomVerification'

const kindOfSessionIssuesMap = mapValues(
  {
    // All Zoom session result codes could be thrown if the
    // camera isn't available or no camera access was confirmed
    // in this case we're marking error as 'NotAllowedError'.
    NotAllowedError: [
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
      'VideoCaptureStreamNotActive',
    ],

    ForegoundLoosedError: [
      // The ZoOm Session was cancelled due to the app being terminated, put to sleep, an OS notification,
      // or the app was placed in the background (for web - tab was switched).
      'ContextSwitch',
    ],

    // All Zoom sdk and session result codes could be thrown if device
    // orientation isn't portrait or was changed during the session
    // in this case we're marking error as 'DeviceOrientationError'.
    DeviceOrientationError: [
      // device orientation was changed during the ZoOm Session
      'OrientationChangeDuringSession',

      // device is in landscape mode
      'LandscapeModeNotAllowed',
    ],

    // User has cancelled session by own decision
    UserCancelled: [
      // The user pressed the cancel button and did not complete the ZoOm Session.
      'UserCancelled',

      // The user pressed the cancel button during New User Guidance.
      'UserCancelledFromNewUserGuidance',

      // The user pressed the cancel button during Retry Guidance.
      'UserCancelledFromRetryGuidance',

      // The user cancelled out of the ZoOm experience while attempting to get camera permissions.
      'UserCancelledWhenAttemptingToGetCameraPermissions',
    ],
  },
  statusesKeys => statusesKeys.map(key => ZoomSessionStatus[key])
)

const kindOfSDKIssuesMap = mapValues(
  {
    // All Zoom sdk initialization result codes could be thrown
    // if device orientation isn't portrait
    // in this case we're marking error as 'DeviceOrientationError'.
    DeviceOrientationError: [
      // device is upside down
      'DeviceInReversePortraitMode',

      // device is in landscape mode
      'DeviceInLandscapeMode',
    ],
  },
  statusesKeys => statusesKeys.map(key => ZoomSDKStatus[key])
)

const FaceVerification = ({ screenProps }) => {
  const gdStore = GDStore.useStore()

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
    async (isSuccess, { status }, lastMessage) => {
      // preparing error object
      const exception = new Error(lastMessage)

      // if session was successfull - returning sucess to the caller
      if (isSuccess) {
        const isCitizen = await goodWallet.isCitizen()

        gdStore.set('isLoggedInCitizen')(isCitizen)
        screenProps.pop({ isValid: true })
        return
      }

      // the following code is needed for ErrorScreen component
      // could display specific error message corresponding to
      // the kind of issue (camera, orientation etc)
      const kindOfTheIssue = findKey(kindOfSessionIssuesMap, statusCodes => statusCodes.includes(status))

      if ('UserCancelled' === kindOfTheIssue) {
        // If user has cancelled face verification by own
        // decision - redirecting back to the into screen
        screenProps.navigateTo('FaceVerificationIntro')
        return
      }

      if (kindOfTheIssue) {
        exception.name = kindOfTheIssue
      } else if (lastMessage.startsWith('Duplicate')) {
        exception.name = 'DuplicateFoundError'
      }

      // handling error
      showErrorScreen(exception, true)
    },
    [screenProps, showErrorScreen]
  )

  // ZoomSDK initialization error handler
  const sdkExceptionHandler = useCallback(
    exception => {
      // the following code is needed for ErrorScreen component
      // could display specific error message corresponding to
      // the kind of issue (camera, orientation etc)
      const errorName = findKey(kindOfSDKIssuesMap, statusCodes => statusCodes.includes(exception.code))

      if (errorName) {
        exception.name = errorName
      }

      // handling error
      showErrorScreen(exception, false)
    },
    [showErrorScreen]
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
    onError: sdkExceptionHandler,
  })

  return null
}

FaceVerification.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default FaceVerification
