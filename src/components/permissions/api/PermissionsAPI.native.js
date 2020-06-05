import { Platform } from 'react-native'
import { check, PERMISSIONS, request } from 'react-native-permissions'

// @flow

import { Permissions } from '../types'

export default new class {
  // permissions enum to platform permissions map
  platformPermissions = {
    [Permissions.CLIPBOARD]: null, // accessing clipboard doesn't requires pemrissions on native

    [Permissions.CAMERA]: Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    }),
  }

  constructor(api) {
    this.api = api
  }
}({ request, check })
