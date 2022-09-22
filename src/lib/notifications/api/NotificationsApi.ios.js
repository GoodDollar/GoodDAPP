import PushNotificationIOS from '@react-native-community/push-notification-ios'
import { NotificationsAPIClass } from './NotificationsApi.common'

export { MessagingAPI } from './NotificationsApi.common'

export const NotificationsAPI = new class extends NotificationsAPIClass {
  async getInitialNotification() {
    let notification = await super.getInitialNotification()

    if (!notification) {
      const { _data } = await PushNotificationIOS.getInitialNotification()

      notification = this._makeFromPayload(_data)
    }

    return notification
  }
}()
