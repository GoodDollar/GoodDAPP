// @flow

import { Platform } from 'react-native'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import { bindAll, every } from 'lodash'

// eslint-disable-next-line import/default
import PushNotification from 'react-native-push-notification'

import { type Permission, Permissions, type PermissionStatus, PermissionStatuses } from '../types'
import { isAndroidNative } from '../../../lib/utils/platform'

export default new class {
  // permissions enum to platform permissions map
  platformPermissions = {
    [Permissions.Clipboard]: null, // accessing clipboard doesn't requires permissions on native

    [Permissions.Camera]: Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    }),
  }

  notificationOptions = Platform.select({
    ios: ['alert', 'badge', 'sound'],
    android: ['alert'],
  })

  constructor(api) {
    this.api = api
    bindAll(this, '_toResult')
  }

  async check(permission: Permission): Promise<PermissionStatus> {
    const { api, platformPermissions, _toResult } = this
    const platformPermission = platformPermissions[permission]
    const { Granted, Denied, Prompt, Undetermined } = PermissionStatuses

    // if no platform permission found - that means feature
    // doesn't requires permissions on this platform
    let result = RESULTS.GRANTED

    // to check notifications permissions we should use separate method
    if (Permissions.Notifications === permission) {
      result = await new Promise(resolve => PushNotification.checkPermissions(status => resolve(_toResult(status))))
    } else if (platformPermissions) {
      // if platform permissions was set - calling api
      result = await api.check(platformPermission)
    }

    switch (result) {
      case RESULTS.UNAVAILABLE:
      case RESULTS.BLOCKED:
        return Denied
      case RESULTS.GRANTED:
        return Granted
      case RESULTS.DENIED:
        return Prompt
      default:
        return Undetermined
    }
  }

  async request(permission: Permission): Promise<boolean> {
    const { api, platformPermissions, notificationOptions, _toResult } = this
    const platformPermission = platformPermissions[permission]

    // there's only check notifications method available
    // on IOS it have extended 'request' version we could specify settings desired.
    // so in case of request notifications we just re-call check
    if (Permissions.Notifications === permission) {
      const requestResult = await PushNotification.requestPermissions(notificationOptions)

      return _toResult(requestResult) === RESULTS.GRANTED
    }

    // if no platform permission found - that means feature
    // doesn't requires permissions on this platform
    if (!platformPermission) {
      return true
    }

    return api.request(platformPermission).then(result => RESULTS.GRANTED === result)
  }

  /** @private */
  _toResult(status) {
    const statusValues = this.notificationOptions.map(option => status[option])

    if (every(statusValues)) {
      return RESULTS.GRANTED
    }

    return isAndroidNative || status.authorizationStatus === 1 ? RESULTS.BLOCKED : RESULTS.DENIED
  }
}({ request, check })
