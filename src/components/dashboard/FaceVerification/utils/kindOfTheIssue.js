import { findKey, mapValues } from 'lodash'
import { ZoomSDKStatus, ZoomSessionStatus } from '../sdk'

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

export const kindOfSessionIssue = exception => {
  const { code } = exception

  return findKey(kindOfSessionIssuesMap, statusCodes => statusCodes.includes(code))
}

export const kindOfSDKIssue = exception => {
  const { code } = exception

  return findKey(kindOfSDKIssuesMap, statusCodes => statusCodes.includes(code))
}
