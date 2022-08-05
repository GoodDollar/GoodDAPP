import { useEffect } from 'react'
import { Notifications } from 'react-native-notifications'
import { t } from '@lingui/macro'
import { LAST_CLAIM_NOTIFICATION } from '../constants/localStorage'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'backgroundFetch' })

export const CLAIM_NOTIFICATION = 'claim-notification'

export const dailyClaimTime = new Date().setUTCHours(12)

export const dailyClaimNotification = async (userStorage, goodWallet) => {
  try {
    const { entitlement: dailyUBI } = await goodWallet.getClaimScreenStatsFuse()

    // We should notify once: only in first bg-fetch call after daily claim time
    const lastClaimNotification = await userStorage.userProperties.get(LAST_CLAIM_NOTIFICATION)
    const needToNotify = dailyUBI && Date.now() >= dailyClaimTime && lastClaimNotification < dailyClaimTime

    if (needToNotify) {
      Notifications.postLocalNotification({
        title: t`Your daily UBI Claim is ready!`,
        body: t`You can claim your daily GoodDollar UBI`,
        fireDate: new Date(),
      })
      await userStorage.userProperties.safeSet(LAST_CLAIM_NOTIFICATION, Date.now())
    }
  } catch (e) {
    log.error('dailyClaimNotification failed:', e.message, e)
  }
}

export const useNotifications = () => {
  useEffect(() => {
    Notifications.registerRemoteNotifications()

    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      completion({ alert: false, sound: false, badge: false })
    })

    Notifications.events().registerNotificationOpened((notification, completion) => {
      completion()
    })
  }, [])
}
