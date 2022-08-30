import { useEffect } from 'react'
import { Notifications } from 'react-native-notifications'
import { t } from '@lingui/macro'
import { assign, invokeMap } from 'lodash'

import logger from '../logger/js-logger'
import usePropsRefs from '../hooks/usePropsRefs'
import { fireEvent, NOTIFICATION_ERROR, NOTIFICATION_RECEIVED, NOTIFICATION_TAPPED } from '../analytics/analytics'
import Config from '../../config/config'

const log = logger.child({ from: 'backgroundFetch' })

export const dailyClaimTime = new Date().setUTCHours(12)

export const NotificationsCategories = {
  CLAIM_NOTIFICATION: 'org.gooddollar.claim-notification',
}

export const dailyClaimNotification = async (userStorage, goodWallet) => {
  const { userProperties } = userStorage
  const dateNow = new Date()
  const now = dateNow.getTime()
  const shouldRemindClaims = userProperties.getLocal('shouldRemindClaims')

  if (!shouldRemindClaims) {
    return
  }

  const payload = {
    title: t`It's that time of the day 💸 💙`,
    body: t`Claim your free GoodDollars now. It takes 10 seconds.`,
    fireDate: dateNow,
    category: NotificationsCategories.CLAIM_NOTIFICATION,
  }

  try {
    const dailyUBI = await goodWallet.checkEntitlement()
    const lastClaimNotification = userProperties.get('lastClaimNotification')

    // no daily UBI or just notified - return
    if (!dailyUBI || (lastClaimNotification && now <= lastClaimNotification)) {
      return
    }

    // notify if current time is dailyClaimTime or later
    let needToNotify = now >= dailyClaimTime
    const { testClaimNotificationFrequency } = Config

    // if test mode enabled
    if (testClaimNotificationFrequency && !needToNotify) {
      // then notify if no last notification or test interval (in minutes) was spent after last notificaton
      needToNotify = !lastClaimNotification || now - lastClaimNotification >= testClaimNotificationFrequency * 60 * 1000
    }

    if (!needToNotify) {
      return
    }

    Notifications.postLocalNotification(payload)
    userProperties.safeSet('lastClaimNotification', now)

    return payload
  } catch (e) {
    assign(e, { payload })

    log.error('dailyClaimNotification failed:', e.message, e)
    throw e
  }
}

export const useNotifications = navigation => {
  const [getNavigation] = usePropsRefs([navigation])

  useEffect(() => {
    // eslint-disable-next-line require-await
    const onClaimNotification = async navigation => navigation.navigate('Claim')
    const events = Notifications.events()

    const onReceived = (notification, completion) => {
      const { payload, title, body } = notification || {}

      log.info(`Notification received: ${title} : ${body}`)
      fireEvent(NOTIFICATION_RECEIVED, { payload })

      // should call completion otherwise notifications won't receive in background
      completion({ alert: true, sound: false, badge: true })
    }

    const onOpened = async (notification, completion) => {
      const navigation = getNavigation()
      const { payload } = notification || {}
      const { category } = payload || {}

      try {
        switch (category) {
          case NotificationsCategories.CLAIM_NOTIFICATION:
            await onClaimNotification(navigation)
            break
          default:
            throw new Error('Unknown / unsupported notification received')
        }

        fireEvent(NOTIFICATION_TAPPED, { payload })
      } catch (e) {
        const { message: error } = e

        log.error('Failed to process notification', error, e, { payload })
        fireEvent(NOTIFICATION_ERROR, { payload, error })
      }

      completion()
    }

    const subscriptions = [
      events.registerNotificationReceivedBackground(onReceived),
      events.registerNotificationReceivedForeground(onReceived),
      events.registerNotificationOpened(onOpened),
    ]

    return () => {
      invokeMap(subscriptions, 'remove')
    }
  }, [])
}
