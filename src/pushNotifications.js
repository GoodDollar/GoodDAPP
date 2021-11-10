// eslint-disable-next-line import/default
import PushNotification from 'react-native-push-notification'
import { FetchResult } from '@react-native-community/push-notification-ios'
import AsyncStorage from './lib/utils/asyncStorage'
import logger from './lib/logger/js-logger'

const log = logger.child({ from: 'pushNotifications' })

const setFeedOpened = async data => {
  await AsyncStorage.setItem('GD_NOTIFICATION_OPENED', data.id)
}

PushNotification.configure({
  onNotification: notification => {
    log.info('NOTIFICATION:', notification)
    const { data } = notification
    setFeedOpened(data)
    notification.finish(FetchResult.NoData)
  },
})
