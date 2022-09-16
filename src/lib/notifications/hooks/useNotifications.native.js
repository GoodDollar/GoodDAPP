import { useCallback, useEffect, useRef } from 'react'
import { Notifications } from 'react-native-notifications'
// eslint-disable-next-line import/default
import PushNotification from 'react-native-push-notification'

import { noop } from 'lodash'
import Config from '../../../config/config'
import { NotificationsAPI } from '../api/NotificationsApi'
import { CHANNEL_ID, NotificationsCategories } from '../constants'
import { useStoreProperty } from '../../wallet/GoodWalletProvider'
import { getCategory, useNotificationsStateSwitch } from './useNotifications.common'

const { notificationTime, notificationSchedule } = Config

const NOTIFICATION = {
  title: "It's that time of the day 💸 💙",
  message: 'Claim your free GoodDollars now. It takes 10 seconds.',
}

export { useNotificationsSupport } from './useNotifications.common'

export const useNotificationsOptions = options => {
  const [scheduleId, setScheduleId] = useStoreProperty('notificationsScheduleId')
  const updateState = useCallback(
    value => {
      let newScheduleId = null

      if (scheduleId) {
        PushNotification.cancelLocalNotification(scheduleId)
      }

      if (value === true) {
        newScheduleId = Math.floor(Math.random() * Math.pow(2, 32))
        PushNotification.localNotificationSchedule({
          ...NOTIFICATION,
          id: newScheduleId,
          channelId: CHANNEL_ID,
          date: notificationTime,
          repeatType: notificationSchedule,
          allowWhileIdle: true,
          userInfo: {
            category: NotificationsCategories.CLAIM_NOTIFICATION,
            ...NOTIFICATION,
          },
        })
      }

      setScheduleId(newScheduleId)
    },
    [scheduleId, setScheduleId],
  )

  const switchState = useNotificationsStateSwitch(scheduleId, updateState, options)

  useEffect(() => {
    PushNotification.createChannel({
      channelId: CHANNEL_ID,
      channelName: 'GoodDollar claim notifications',
    })
  }, [])

  return switchState
}

export const useNotifications = (onOpened = noop, onReceived = noop) => {
  const [enabled] = useNotificationsOptions()
  const mountedRef = useRef(false)

  const receivedHandler = useCallback(
    (notification, completion = noop) => {
      onReceived(notification, getCategory(notification))

      // should call completion otherwise notifications won't receive in background
      completion({ alert: true, sound: true, badge: false })
    },
    [onReceived],
  )

  const openedHandler = useCallback(
    (notification, completion = noop) => {
      onOpened(notification, getCategory(notification))
      completion()
    },
    [onOpened],
  )

  useEffect(() => {
    if (!enabled || mountedRef.current) {
      return
    }

    mountedRef.current = true
    Notifications.registerRemoteNotifications()

    NotificationsAPI.getInitialNotification()
      .catch(noop)
      .then(notification => {
        if (!notification) {
          return
        }

        receivedHandler(notification)
        openedHandler(notification)
      })
  }, [enabled, openedHandler, receivedHandler])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const events = Notifications.events()

    const subscriptions = [
      events.registerNotificationReceivedForeground(receivedHandler),
      events.registerNotificationReceivedBackground(receivedHandler),
      events.registerNotificationOpened(openedHandler),
    ]

    return () => {
      subscriptions.forEach(subscription => subscription.remove())
    }
  }, [enabled, receivedHandler, openedHandler])
}
