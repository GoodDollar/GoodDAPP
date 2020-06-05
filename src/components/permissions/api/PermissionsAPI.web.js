// @flow

import logger from '../../../lib/logger/pino-logger'
import { Permissions, PermissionStatuses } from '../types'

const log = logger.child({ from: 'PermissionsAPI' })

export default new class PermissionsAPIWeb {
  // permissions enum to platform permissions map
  platformPermissions = {
    [Permissions.Camera]: 'camera',
    [Permissions.Clipboard]: 'clipboard-write',
  }

  /*
   * The main method which should be used to get status of specific permission kind
   * @param {string} kind
   * @return Promise<string> - one of PermissionStatusesEnum
   */
  query(kind) {
    switch (kind) {
      case Permissions.Camera:
        return this._getCameraPermissionStatus()

      case Permissions.Clipboard:
        return this._getClipboardPermissionStatus()

      default:
        return false
    }
  }

  /*
   * Private method used to verify if Browser's PermissionAPI is available and get permission status by provided kind
   * @private
   * @param {string} kind
   * @return (undefined - Browser's PermissionAPI is not available) or (Promise<string> - one of PermissionStatusesEnum)
   */
  async _getStatusByBrowsersPermissionAPI(kind) {
    // get Browser's PermissionAPI object
    const permissionsApi = navigator.permissions

    // check if Browser's PermissionsAPI is available in current browser
    if (permissionsApi) {
      // if Browser's PermissionsAPI i available then fetch permission status by received kind
      // query method will return PermissionStatus object
      const permissionStatusObj = await permissionsApi.query({ name: this.platformPermissions[kind] })

      // fetch and return permission status from 'PermissionStatus.state' field
      return permissionStatusObj.state
    }
  }

  /*
   * Private method used to get camera permission status
   * @private
   * @return Promise<string> - one of PermissionStatusesEnum
   */
  async _getCameraPermissionStatus() {
    // get camera permission status by Browser's PermissionsAPI
    const browserPermissionStatus = await this._getStatusByBrowsersPermissionAPI('camera')

    // check if value exists
    if (browserPermissionStatus) {
      // return if exists
      return browserPermissionStatus
    }

    // get camera status by requesting a video stream manually
    return this._getCameraPermissionStatusByRequestingStream()
  }

  /*
   * Private method used to get camera permission status by manually request video stream
   * Used when Browser's PermissionsAPI is not available in current browser
   * @private
   * @return Promise<string> - one of [PermissionStatusesEnum.DENIED, PermissionStatusesEnum.GRANTED]
   */
  async _getCameraPermissionStatusByRequestingStream() {
    // fetching the getUserMedia method from navigator
    const getUserMedia = navigator.mediaDevices.getUserMedia

    // verify if getUserMedia is available
    if (!getUserMedia) {
      // make log - getUserMedia is not supported
      log.warn('getUserMedia() is not supported by this browser')

      // return denied as local video stream is not supported in this browser
      return PermissionStatuses.Denied
    }

    try {
      // requesting video stream to verify its available
      await getUserMedia({
        video: true,
      })
    } catch (e) {
      // make log of failed video stream request
      log.warn('getUserMedia failed:', e.message, e)

      // return denied for failure cases
      return PermissionStatuses.Denied
    }

    // if the code reached this lines - it mean that video stream request is successful and permission is allowed
    // return granted status
    return PermissionStatuses.Granted
  }

  async _getClipboardPermissionStatus() {
    try {
      // trying to read data from clipboard
      await navigator.clipboard.read()
    } catch (e) {
      // if clipboard access is denied then NotAllowedError will occur
      if (e.name === 'NotAllowedError') {
        return false
      }
    }

    // in case error did not appear - clipboard access granted
    return true
  }
}()
