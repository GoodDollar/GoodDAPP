import { useEffect } from 'react'
import { Notifications } from 'react-native-notifications'
import { t } from '@lingui/macro'

import logger from '../logger/js-logger'
import usePropsRefs from '../hooks/usePropsRefs'

const log = logger.child({ from: 'backgroundFetch' })

export const dailyClaimTime = new Date().setUTCHours(12)

export const NotificationsCategories = {
  CLAIM_NOTIFICATION: 'claim-notification',
}

export const dailyClaimNotification = async (userStorage, goodWallet) => {
  try {
    const dailyUBI = await goodWallet.checkEntitlement()

    // We should notify once: only in first bg-fetch call after daily claim time
    const lastClaimNotification = await userStorage.userProperties.get('lastClaimNotification')
    const needToNotify = dailyUBI && Date.now() >= dailyClaimTime && lastClaimNotification < dailyClaimTime

    if (needToNotify) {
      Notifications.postLocalNotification({
        title: t`Your daily UBI Claim is ready!`,
        body: dailyUBI,
        fireDate: new Date(),
        category: NotificationsCategories.CLAIM_NOTIFICATION,
      })

      await userStorage.userProperties.safeSet('lastClaimNotification', Date.now())
    }
  } catch (e) {
    log.error('dailyClaimNotification failed:', e.message, e)
  }
}

export const useNotifications = navigation => {
  const [getNavigation] = usePropsRefs([navigation])

  useEffect(() => {
    // eslint-disable-next-line require-await
    const onClaimNotification = async navigation => navigation.navigate('Claim')

    Notifications.registerRemoteNotifications()

    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      completion({ alert: false, sound: false, badge: false })
    })

    Notifications.events().registerNotificationOpened((notification, completion) => {
      completion()
    })

    Notifications.events().registerNotificationOpened(async (notification, completion) => {
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
    })
  }, [])
}
