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

  constructor(api) {
    this.api = api
  }

  async check(permission: Permission): Promise<PermissionStatus> {
    const { api, platformPermissions } = this
    const platformPermission = platformPermissions[permission]
    const { Granted, Denied, Prompt, Undetermined } = PermissionStatuses

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return Granted
    }

    const result = await api.check(platformPermission)

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

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return true
    }

    const result = await api.request(platformPermission)

    return RESULTS.GRANTED === result
  }
}({ request, check })
