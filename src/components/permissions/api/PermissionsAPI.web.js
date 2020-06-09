// @flow

import logger from '../../../lib/logger/pino-logger'
import { type Permission, Permissions, type PermissionStatus, PermissionStatuses } from '../types'

const log = logger.child({ from: 'PermissionsAPI' })

class PermissionsAPI {
  // permissions enum to platform permissions map
  platformPermissions = {
    [Permissions.Camera]: 'camera',
    [Permissions.Clipboard]: 'clipboard-read',
  }

  constructor(api, clipboardApi, mediaApi) {
    this.api = api
    this.clipboardApi = clipboardApi
    this.mediaApi = mediaApi
  }

  /*
   * Retrieves status of permission
   *
   * @param {Permission} Permission needs to be checked
   * @return Promise<PermissionStatus> Status of the permission
   */
  async check(permission: Permission): Promise<PermissionStatus> {
    const { api, platformPermissions } = this
    const { Granted, Denied, Prompt, Undetermined } = PermissionStatuses
    const platformPermission = platformPermissions[permission]

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return Granted
    }

    // Permissions API not available - return undetermined status
    if (!api) {
      return Undetermined
    }

    const { state, status } = await api.query({ name: platformPermission })

    // could be changed/extended so we need this switch to map them to platform-independed statuses
    switch (status || state) {
      case 'granted':
        return Granted
      case 'prompt':
        return Prompt
      case 'denied':
        return Denied
      default:
        return Undetermined
    }
  }

  /*
   * Requests for permission
   *
   * @param {Permission} Permission we're requesting
   * @return Promise<boolean> Was permission granted or nor
   */
  async request(permission: Permission): Promise<PermissionStatus> {
    const platformPermission = this.platformPermissions[permission]
    const { Clipboard, Camera } = Permissions

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return true
    }

    try {
      // requesting permissions by direct calling corresponding APIs
      // as permissions API doesn't supports yet requesting for permissions
      switch (permission) {
        case Camera:
          await this._requestCameraPermission()
          break
        case Clipboard:
          await this._requestClipboardPermissions()
          break
      }

      return true
    } catch {
      return false
    }
  }

  /*
   * Requests camera permissions by manually requesting for a video stream

   * @return {Promise<void>}
   * @throws {Error} If permission wasn't granted
   * @private
   */
  async _requestCameraPermission(): Promise<void> {
    // fetching the getUserMedia method from navigator
    const { getUserMedia } = this.mediaApi || {}

    // verify if getUserMedia is available
    if (!getUserMedia) {
      const message = 'getUserMedia() is not supported by this browser'

      // make log - getUserMedia is not supported
      log.warn(message)

      // thow exception that local video stream is not supported in this browser
      throw new Error(message)
    }

    try {
      // requesting video stream to verify its available
      await getUserMedia({ video: true })
    } catch (exception) {
      const { message } = exception

      // make log of failed video stream request
      log.warn('getUserMedia failed:', message, exception)

      // rethrow exception for failure case
      throw exception
    }

    // if the code reached end of the function's body - it mean that
    // video stream request was successful and permission was allowed
  }

  /**
   * Requests clipboard permissions by manually reading clipboard text
   *
   * @returns {Promise<void>}
   */
  async _requestClipboardPermissions(): Promise<void> {
    const { clipboardApi } = this

    // verify if clipboard API is available
    if (!clipboardApi) {
      const message = 'navigator.clipboard is not supported by this browser'

      // make log - clipboard is not supported
      log.warn(message)

      // throw exception that clipboard is not supported in this browser
      throw new Error(message)
    }

    try {
      // trying to read data from clipboard
      await clipboardApi.readText()
    } catch (exception) {
      const { name, message } = exception

      // make log of failed video stream request
      log.warn('clipboard.readText() failed:', message, exception)

      // if clipboard access is denied then NotAllowedError will occur
      if ('NotAllowedError' == name) {
        // rethrow exception for failure case
        throw exception
      }
    }

    // in case error did not appear - clipboard access granted
  }
}

const { permissions, clipboard, mediaDevices } = navigator

export default new PermissionsAPI(permissions, clipboard, mediaDevices)
