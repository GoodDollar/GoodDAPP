import { useEffect } from 'react'
import { Notifications } from 'react-native-notifications'
import { t } from '@lingui/macro'
import { LAST_CLAIM_NOTIFICATION } from '../constants/localStorage'
import logger from '../logger/js-logger'

const log = logger.child({ from: 'backgroundFetch' })

export const FEED_NOTIFICATIONS = 'feed-notification'

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

// Feed notifications flow is temporary disabled :
// export const feedNotifications = async (userStorage, goodWallet) => {
//   const taskId = FEED_NOTIFICATIONS
//   log.info('[BackgroundFetch] taskId: ', taskId)
//
//   // eslint-disable-next-line require-await
//   const waitUntil = async ms => new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), ms))
//
//   // eslint-disable-next-line require-await
//   const hasConnection = async () => Promise.race([Promise.all([goodWallet.ready, userStorage.ready]), waitUntil(10000)])
//
//   const checkNotifications = async () => {
//     try {
//       await hasConnection()
//       await onFeedReady(userStorage)
//     } catch (e) {
//       return BackgroundFetch.finish(taskId)
//     }
//
//     const lastFeedNotification = await userStorage.userProperties.get(LAST_FEED_NOTIFICATION)
//     const feed = await userStorage.getFeedPage(20, true)
//
//     log.info('lastFeedCheck', lastFeedNotification)
//     log.info('feed', feed)
//
//     const hasNewPayment = (type, status) => {
//       return type === 'receive' && status === 'completed'
//     }
//
//     const hasNewPaymentWithdraw = (type, status) => {
//       return type === 'send' && status === 'completed'
//     }
//
//     const newFeeds = feed.filter(feedItem => {
//       const { date, type, status } = feedItem
//       const feedDate = moment(new Date(date)).valueOf()
//       const isActual =
//         (hasNewPayment(type, status) || hasNewPaymentWithdraw(type, status)) && lastFeedNotification < feedDate
//       return isActual && feedItem
//     })
//
//     log.info('new feed items', { newFeeds })
//
//     log.info('pushing local notifications for feed items:', { total: newFeeds.length })
//
//     newFeeds.map(async feed => {
//       Notifications.postLocalNotification({
//         title: t`Payment from/to ${get(feed, 'data.counterPartyDisplayName', 'Unknown')} received/accepted`,
//         body: t`G$ ${get(feed, 'data.amount', 0)}`,
//         id: feed.id,
//         userInfo: { id: feed.id },
//         fireDate: new Date(),
//       })
//
//       await userStorage.userProperties.safeSet(LAST_FEED_NOTIFICATION, moment(new Date(feed.date)).valueOf())
//     })
//   }
//
//   // Check notifications immediately on headless task call
//   await checkNotifications()
//
//   // Subscribe to feed update
//   // userStorage.feedStorage.feedEvents.on('updated', checkNotifications)
// }
