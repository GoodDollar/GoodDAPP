import { Notifications } from 'react-native-notifications'
import PushNotificationIOS from '@react-native-community/push-notification-ios'

export const getInitialNotification = async () => {
  let notification = await Notifications.getInitialNotification()

  if (!notification) {
    const { _data } = await PushNotificationIOS.getInitialNotification()
    const { title, message } = _data

    notification = { title, body: message, payload: _data }
  }

  return notification
}
