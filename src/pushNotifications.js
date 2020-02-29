import PushNotification from 'react-native-push-notification'
import { FetchResult } from '@react-native-community/push-notification-ios'

PushNotification.configure({
  onNotification: notification => {
    console.log('NOTIFICATION:', notification)
    notification.finish(FetchResult.NoData)
  },
})
