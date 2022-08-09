import { useEffect } from 'react'
import { Notifications } from 'react-native-notifications'
import { t } from '@lingui/macro'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'backgroundFetch' })

export const CLAIM_NOTIFICATION = 'claim-notification'

export const dailyClaimTime = new Date().setUTCHours(12)

export const notificationsCategories = {
  CLAIM: 'CLAIM',
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
        category: notificationsCategories.CLAIM,
      })
      await userStorage.userProperties.safeSet('lastClaimNotification', Date.now())
    }
  } catch (e) {
    log.error('dailyClaimNotification failed:', e.message, e)
  }
}

export const useNotifications = navigation => {
  useEffect(() => {
    Notifications.registerRemoteNotifications()

    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      completion({ alert: false, sound: false, badge: false })
    })

    Notifications.events().registerNotificationOpened((notification, completion) => {
      completion()
    })

    Notifications.events().registerNotificationOpened((notification, completion) => {
      if (notification.payload.category === notificationsCategories.CLAIM) {
        navigation.navigate('Claim')
      }
      completion()
    })
  }, [])
}
