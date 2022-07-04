// @flow

import { Platform } from 'react-native'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'

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

  async check(permission: Permission): Promise<PermissionStatus> {
    const { api, platformPermissions, notificationOptions } = this
    const platformPermission = platformPermissions[permission]
    const { Granted, Denied, Prompt, Undetermined } = PermissionStatuses

    // if no platform permission found - that means feature
    // doesn't requires permissions on this platform
    let result = RESULTS.GRANTED

    // to check notifications permissions we should use separate method
    if (Permissions.Notifications === permission) {
      const { status } = await Platform.select({
        // eslint-disable-next-line require-await
        ios: async () => api.requestNotifications(notificationOptions),
        // eslint-disable-next-line require-await
        android: async () => api.checkNotifications(),
      })

      result = status
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

  async request(permission: Permission): Promise<PermissionStatus> {
    const { api, platformPermissions } = this
    const platformPermission = platformPermissions[permission]

    // there's only check notifications method available
    // on IOS it have extended 'request' version we could specify settings desired.
    // so in case of request notifications we just re-call check
    if (Permissions.Notifications === permission) {
      return this.check(permission)
    }

    // if no platform permission found - that means feature
    // doesn't requires permissions on this platform
    if (!platformPermission) {
      return true
    }

    const result = await api.request(platformPermission)

    return RESULTS.GRANTED === result
  }
}({ request, check })
