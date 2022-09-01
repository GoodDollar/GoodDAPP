import { useEffect } from 'react'
import { Notifications } from 'react-native-notifications'
import { t } from '@lingui/macro'
import { assign, invokeMap, pickBy } from 'lodash'

import logger from '../logger/js-logger'
import usePropsRefs from '../hooks/usePropsRefs'
import { fireEvent, NOTIFICATION_ERROR, NOTIFICATION_RECEIVED, NOTIFICATION_TAPPED } from '../analytics/analytics'
import Config from '../../config/config'
import { useUserStorage } from '../wallet/GoodWalletProvider'

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
    category: NotificationsCategories.CLAIM_NOTIFICATION,
  }

  try {
    const dailyUBI = await goodWallet.checkEntitlement()
    const lastClaimNotification = userProperties.get('lastClaimNotification') || 0

    // no daily UBI or just notified - return
    if (!dailyUBI || (lastClaimNotification && now <= lastClaimNotification)) {
      return
    }

    const { testClaimNotification } = Config

    // notify if current time is dailyClaimTime or later OR test notifications are enabled
    const needToNotify = now >= dailyClaimTime || testClaimNotification

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
  const userStorage = useUserStorage()
  const { userProperties } = userStorage || {}

  useEffect(() => {
    if (!userProperties) {
      return
    }

    const shouldRemindClaims = userProperties.getLocal('shouldRemindClaims')

    if (!shouldRemindClaims) {
      return
    }

    // eslint-disable-next-line require-await
    const onClaimNotification = async navigation => navigation.navigate('Claim')
    Notifications.registerRemoteNotifications()
    const events = Notifications.events()

    const onReceived = (notification, completion) => {
      const { payload, title, body } = notification || {}

      log.info(`Notification received: ${title} : ${body}`)
      fireEvent(NOTIFICATION_RECEIVED, { payload })

      // should call completion otherwise notifications won't receive in background
      completion({ alert: true, sound: true, badge: false })
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

        fireEvent(NOTIFICATION_TAPPED, pickBy({ payload }))
      } catch (e) {
        const { message: error } = e

        log.error('Failed to process notification', error, e, { payload })
        fireEvent(NOTIFICATION_ERROR, pickBy({ payload, error }))
      }

      completion()
    }

    const subscriptions = [
      events.registerNotificationReceivedForeground(onReceived),
      events.registerNotificationReceivedBackground(onReceived),
      events.registerNotificationOpened(onOpened),
    ]

    return () => {
      invokeMap(subscriptions, 'remove')
    }
  }, [userProperties])
}
