import { appEnv } from '../utils/env'

const DefaultNotificationConfig = {
  notificationSchedule: 'minute', // repeat in each minute
  notificationTime: new Date(Date.now() + 60 * 1000), // 1 minute after app been started
}

const NotificationProdConfig = {
  notificationSchedule: 'day', // repeat daily
  notificationTime: (() => {
    // 12 PM UTC
    const date = new Date()

    date.setUTCHours(12, 0, 0, 0)
    return date
  })(),
}

const NotificationConfig =
  {
    production: NotificationProdConfig,
  }[appEnv] || DefaultNotificationConfig

export default NotificationConfig
