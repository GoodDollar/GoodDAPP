/* eslint no-console: "off" */

import { findKey, get, mapValues } from 'lodash'
import { FaceTecSDKStatus, FaceTecSessionStatus } from '../sdk/FaceTecSDK'

const statusTransformer = statusesEnum => statusesKeys =>
  statusesKeys.reduce((statuses, key) => {
    if (statusesEnum && key in statusesEnum) {
      statuses.push(statusesEnum[key])
    }

    return statuses
  }, [])

// All FaceTec sdk initialization result codes could be thrown
// if resources were failed to load. In this case we coundn't
// continue and have to ask user for reload the app (web only)
const ResourceLoadingError = [
  // FaceTec SDK is still loading resources.
  'StillLoadingResources',

  // FaceTec SDK could not load resources.
  'ResourcesCouldNotBeLoadedOnLastInit',
]

// All FaceTec sdk initialization result codes
// could be thrown if runnin inside iframe
const IFrameError = [
  // FaceTec doesn't supports to run from iframe.
  'IFrameNotAllowedWithoutPermission',
  'NotAllowedUseIframeConstructor',
  'NotAllowedUseNonIframeConstructor',
]

// All FaceTec sdk initialization result codes could be thrown
// if the license was failed to be proven
const LicenseError = [
  // The Device License Key Identifier provided was invalid.
  'InvalidDeviceKeyIdentifier',

  // License was expired, contained invalid text, or you are attempting to initialize on a domain that is not specified in your license.
  'KeyExpiredOrInvalid',
]

const kindOfSessionIssuesMap = mapValues(
  {
    // All FaceTec session result codes could be thrown if the
    // camera isn't available or no camera access was confirmed
    // in this case we're marking error as 'NotAllowedError'.
    NotAllowedError: [
      // camera permissions wasn't given
      'UserCancelledWhenAttemptingToGetCameraPermissions',

      // no camera available.
      'CameraDoesNotExist',

      // camera was not enabled.
      'CameraNotEnabled',

      // camera permissions denied.
      'CameraPermissionDenied',

      // selected camera is not active
      'CameraNotRunning',

      // camera is busy because another FaceTec Session in progress.
      'SessionInProgress',
    ],

    ForegroundLoosedError: [
      // The FaceTec Session was cancelled due to the app being terminated, put to sleep, an OS notification,
      // or the app was placed in the background (for web - tab was switched).
      'ContextSwitch',
    ],

    // All FaceTec sdk and session result codes could be thrown if device
    // orientation isn't portrait or was changed during the session
    // in this case we're marking error as 'DeviceOrientationError'.
    DeviceOrientationError: [
      // device orientation was changed during the FaceTec Session
      'OrientationChangeDuringSession',

      // device is in landscape mode
      'LandscapeModeNotAllowed',

      // device is in reversed portrait mode (upside down)
      'ReversePortraitNotAllowed',
    ],

    // User has cancelled session by own decision
    UserCancelled: [
      // The user pressed the cancel button and did not complete the FaceTec Session.
      'UserCancelled',

      // The user pressed the cancel button during New User Guidance.
      'UserCancelledFromNewUserGuidance',

      // The user pressed the cancel button during Retry Guidance.
      'UserCancelledFromRetryGuidance',

      // The FaceTec Session cancelled because user pressed the Get Ready screen subtext message.
      'UserCancelledViaClickableReadyScreenSubtext',

      // The user pressed the cancel button (hardware) and did not complete the Session.
      'UserCancelledViaHardwareButton',
    ],

    // All FaceTec sdk initialization result codes could be thrown
    // if runnin on non-supported device / environment
    NotSupportedError: IFrameError,

    ResourceLoadingError,
  },
  statusTransformer(FaceTecSessionStatus),
)

const sdkStatusTransformer = statusTransformer(FaceTecSDKStatus)

const kindOfSDKIssuesMap = mapValues(
  {
    // All FaceTec sdk initialization result codes could be thrown
    // if device orientation isn't portrait
    // in this case we're marking error as 'DeviceOrientationError'.
    DeviceOrientationError: [
      // device is upside down
      'DeviceInReversePortraitMode',

      // device is in landscape mode
      'DeviceInLandscapeMode',
    ],

    // All FaceTec sdk initialization result codes could be thrown
    // if runnin on non-supported device / environment
    NotSupportedError: [
      // This device/platform/browser/version combination is not supported by FaceTec.
      'DeviceNotSupported',

      ...IFrameError,
    ],

    // All FaceTec sdk initialization result codes could be thrown
    // related to the errors couldn't dissapear in the future calls
    // For example, orientation errors could disapper if user will
    // position his device correctly during the next attempt but
    // if license key is expored - it's unrecoverable error because
    // there's no chance this could be changed.
    // Used for handle the case when we should prevent next initialization attempts
    UnrecoverableError: [
      ...LicenseError,

      // This version of FaceTec SDK is deprecated.
      'VersionDeprecated',

      // The provided public encryption key is missing or invalid.
      'EncryptionKeyInvalid',

      // FV has been passed but user hasn't been whitelisted in contracts
      'UnableToWhitelist',
    ],

    ResourceLoadingError,
  },
  sdkStatusTransformer,
)

const licenceIssuesCodes = sdkStatusTransformer(LicenseError)
const createPredicate = exception => codes => codes.includes(get(exception, 'code'))

export const ExceptionType = {
  SDK: 'sdk',
  Session: 'session',
}

export const isLicenseIssue = exception => createPredicate(exception)(licenceIssuesCodes)

export const kindOfSessionIssue = exception => findKey(kindOfSessionIssuesMap, createPredicate(exception))

export const kindOfSDKIssue = exception => findKey(kindOfSDKIssuesMap, createPredicate(exception))
