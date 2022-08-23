import { useEffect } from 'react'
import { Notifications } from 'react-native-notifications'
import { t } from '@lingui/macro'
import { invokeMap } from 'lodash'

import logger from '../logger/js-logger'
import usePropsRefs from '../hooks/usePropsRefs'
import Config from '../../config/config'

const log = logger.child({ from: 'backgroundFetch' })

export const dailyClaimTime = new Date().setUTCHours(12)

export const NotificationsCategories = {
  CLAIM_NOTIFICATION: 'claim-notification',
}

export const dailyClaimNotification = async (userStorage, goodWallet) => {
  const { userProperties } = userStorage
  const dateNow = new Date()
  const now = dateNow.getTime()
  const shouldRemindClaims = userProperties.getLocal('shouldRemindClaims')

  if (!shouldRemindClaims) {
    return
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

    Notifications.postLocalNotification({
      title: t`It's that time of the day 💸 💙`,
      body: t`Claim your free GoodDollars now. It takes 10 seconds.`,
      fireDate: dateNow,
      category: NotificationsCategories.CLAIM_NOTIFICATION,
    })

    userProperties.safeSet('lastClaimNotification', now)
  } catch (e) {
    log.error('dailyClaimNotification failed:', e.message, e)
  }
}

export const useNotifications = navigation => {
  const [getNavigation] = usePropsRefs([navigation])

  useEffect(() => {
    // eslint-disable-next-line require-await
    const onClaimNotification = async navigation => navigation.navigate('Claim')
    const events = Notifications.events()
    
    const onForeground = (notification, completion) => {
      log.info(`Notification received in foreground: ${notification.title} : ${notification.body}`)
      // should call completion otherwise notifications won't receive
      completion({ alert: false, sound: false, badge: false })
    }
    
    const onOpened = async (notification, completion) => {
      const navigation = getNavigation()
      const { category } = notification?.payload || {}

      switch (category) {
        case NotificationsCategories.CLAIM_NOTIFICATION:
          await onClaimNotification(navigation)
          break
        default:
          break
      }

      completion()
    }
    
    const subscriptions = [
      events.registerNotificationReceivedForeground(onForeground),
      events.registerNotificationOpened(onOpened),
    ]    

    return () => {
      invokeMap(subscriptions, 'remove')
    }
  }, [])
}
