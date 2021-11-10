// @flow
import { invokeMap, isFunction } from 'lodash'

import logger from '../../../lib/logger/js-logger'
import { type Permission, Permissions, type PermissionStatus, PermissionStatuses } from '../types'

class PermissionsAPI {
  // permissions enum to platform permissions map
  platformPermissions = {
    [Permissions.Camera]: 'camera',
    [Permissions.Clipboard]: 'clipboard-read',
  }

  constructor(api, clipboardApi, mediaApi, log) {
    this.log = log
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
    const { platformPermissions } = this
    const { Granted, Denied, Prompt, Undetermined } = PermissionStatuses
    const platformPermission = platformPermissions[permission]

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return Granted
    }

    const status = await this._queryPermissions(platformPermission)

    // could be changed/extended so we need this switch to map them to platform-independed statuses
    switch (status) {
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
        default:
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
    const { mediaApi, log } = this

    // verify if navigator.mediaDevices is available
    if (!mediaApi || !isFunction(mediaApi.getUserMedia)) {
      const message = 'navigator.mediaDevices is not supported by this browser'

      // make log - getUserMedia is not supported
      log.warn(message)

      // thow exception that local video stream is not supported in this browser
      throw new Error(message)
    }

    try {
      // requesting video stream to verify its available
      const stream = await mediaApi.getUserMedia({ video: true })

      // releasing tracks on success
      invokeMap(stream.getTracks(), 'stop')
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
    const { clipboardApi, log } = this

    // verify if clipboard API is available
    if (!clipboardApi || !isFunction(clipboardApi.readText)) {
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
      if ('NotAllowedError' === name) {
        // rethrow exception for failure case
        throw exception
      }
    }

    // in case error did not appear - clipboard access granted
  }

  /**
   * Queries browser's permissions API
   *
   * @param {string} name Name of the permission
   * @returns {Promise<'granted' | 'denied' | 'prompt' | ''>} Promise resolves with the permission status.
   * If status couldn't be determinated (no API or permission not supported) - will be resolved with empty string
   */
  async _queryPermissions(name: string): Promise<'granted' | 'denied' | 'prompt' | ''> {
    let result = '' // undetermined by default. if api supported and request succeeded - will be updated to the actual status
    const { api, log } = this

    // if Permissions API is available
    if (api) {
      try {
        // requesting permissions
        const { state, status } = await api.query({ name })

        // if succeeded - setting value to return from the response
        result = status || state
      } catch (exception) {
        const { message } = exception

        log.warn(`Permission ${name} isn't currently supported by the browser`, message, exception)
      }
    }

    return result
  }
}

const { permissions, clipboard, mediaDevices } = navigator

export default new PermissionsAPI(permissions, clipboard, mediaDevices, logger.child({ from: 'PermissionsAPI' }))
