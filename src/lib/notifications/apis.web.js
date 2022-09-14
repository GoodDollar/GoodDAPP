import { PermissionStatuses } from '../../components/permissions/types'
import {noop} from "lodash/util";

export const PermissionsAPI = new class {
  // permissions enum to platform permissions map
  platformPermissions = {}

  disabledPermissions = {
    [Permissions.Notifications]: true,
  }

  /*
   * Retrieves status of permission
   *
   * @param {Permission} Permission needs to be checked
   * @return Promise<PermissionStatus> Status of the permission
   */
  async check(permission) {
    const { platformPermissions, disabledPermissions } = this
    const { Granted, Undetermined, Disabled } = PermissionStatuses
    const platformPermission = platformPermissions[permission]

    // if permission is disabled - returning disabled status
    // this needs to temporarly ignore notifications permissions requests on web
    if (permission in disabledPermissions) {
      return Disabled
    }

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return Granted
    }

    return Undetermined
  }

  /*
   * Requests for permission
   *
   * @param {Permission} Permission we're requesting
   * @return Promise<boolean> Was permission granted or nor
   */
  async request(permission) {
    const { platformPermissions, disabledPermissions } = this
    const platformPermission = platformPermissions[permission]

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!(permission in disabledPermissions) && !platformPermission) {
      return true
    }

    return false
  }
}()

export const useNotifications = noop

export const getInitialNotification = async () => undefined
