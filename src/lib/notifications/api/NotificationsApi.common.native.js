// @flow

import { Notifications } from 'react-native-notifications'
// eslint-disable-next-line import/default
import { noop } from 'lodash'

export const MessagingAPI = {
  getToken: noop,
  deleteToken: noop,
  onMessage: noop,
}

export class NotificationsAPIClass {
  getInitialNotification() {
    return Notifications.getInitialNotification()
  }

  isSupported() {
    return true
  }
}
