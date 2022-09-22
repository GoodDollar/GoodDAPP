// eslint-disable-next-line import/default
import PushNotification from 'react-native-push-notification'
import { NotificationsAPIClass } from './NotificationsApi.common'

export { MessagingAPI } from './NotificationsApi.common'

export const NotificationsAPI = new class extends NotificationsAPIClass {
  async getInitialNotification() {
    let notification = await super.getInitialNotification()

    if (!notification) {
      const initialNotificationPromise = new Promise(resolve => PushNotification.popInitialNotification(resolve))
      const { data } = await initialNotificationPromise
      const { title, message } = data

      notification = { title, body: message, payload: data }
    }

    return notification
  }
}()
