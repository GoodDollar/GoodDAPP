// @flow

import { Platform } from 'react-native'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import { every } from 'lodash'
// eslint-disable-next-line import/default
import PushNotification from 'react-native-push-notification'

import { type Permission, Permissions, type PermissionStatus, PermissionStatuses } from '../types'

export default new class {
  // permissions enum to platform permissions map
  platformPermissions = {
    [Permissions.Clipboard]: null, // accessing clipboard doesn't requires permissions on native

    [Permissions.Camera]: Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    }),
  }

  notificationOptions = ['alert', 'badge', 'sound']

  constructor(api) {
    this.api = api
  }

  checkStatus = status => {
    const { notificationOptions } = this

    const statusValues = notificationOptions.map(option => status[option])
    const result = every(statusValues)
    if (result) {
      return RESULTS.GRANTED
    }

    return status.authorizationStatus === 1 ? RESULTS.BLOCKED : RESULTS.DENIED
  }

  async check(permission: Permission): Promise<PermissionStatus> {
    const { api, platformPermissions, checkStatus } = this
    const platformPermission = platformPermissions[permission]
    const { Granted, Denied, Prompt, Undetermined } = PermissionStatuses

    // if no platform permission found - that means feature
    // doesn't requires permissions on this platform
    let result = RESULTS.GRANTED

    // to check notifications permissions we should use separate method
    if (Permissions.Notifications === permission) {
      const checkPermissionPromise = new Promise((resolve, reject) => {
        PushNotification.checkPermissions(status => {
          const checkResult = checkStatus(status)

          resolve(checkResult)

          // if (checkResult) {
          //   return resolve(RESULTS.GRANTED)
          // }

          // resolve(isAndroidNative ? RESULTS.BLOCKED : RESULTS.DENIED)
        })
      })

      result = await checkPermissionPromise
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
    const { api, platformPermissions, notificationOptions, checkStatus } = this
    const platformPermission = platformPermissions[permission]

    // there's only check notifications method available
    // on IOS it have extended 'request' version we could specify settings desired.
    // so in case of request notifications we just re-call check
    if (Permissions.Notifications === permission) {
      const requestResult = await PushNotification.requestPermissions(notificationOptions)

      return checkStatus(requestResult) === RESULTS.GRANTED
    }

    // if no platform permission found - that means feature
    // doesn't requires permissions on this platform
    if (!platformPermission) {
      return true
    }

    return api.request(platformPermission).then(result => RESULTS.GRANTED === result)
  }
}({ request, check })
