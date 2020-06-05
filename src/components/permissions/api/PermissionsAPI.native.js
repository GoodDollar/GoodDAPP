// @flow

import { Platform } from 'react-native'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'

import { type Permission, Permissions, type PermissionStatus, PermissionStatuses } from '../types'

export default new class {
  // permissions enum to platform permissions map
  platformPermissions = {
    [Permissions.Clipboard]: null, // accessing clipboard doesn't requires pemrissions on native

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

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return PermissionStatuses.Granted
    }

    const result = await api.check(platformPermission)

    switch (result) {
      case RESULTS.UNAVAILABLE:
      case RESULTS.BLOCKED:
        return PermissionStatuses.Denied
      case RESULTS.GRANTED:
        return PermissionStatuses.Granted
      case RESULTS.DENIED:
        return PermissionStatuses.Prompt
      default:
        return PermissionStatuses.Undetermined
    }
  }

  async request(permission: Permission): Promise<PermissionStatus> {
    const { api, platformPermissions } = this
    const platformPermission = platformPermissions[permission]

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return PermissionStatuses.Granted
    }

    const result = await api.request(platformPermission)

    return RESULTS.GRANTED === result
  }
}({ request, check })
