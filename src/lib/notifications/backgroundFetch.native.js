import BackgroundFetch from 'react-native-background-fetch'
// eslint-disable-next-line import/default
import PushNotification from 'react-native-push-notification'
import moment from 'moment'
import { get, includes, once } from 'lodash'
import { t } from '@lingui/macro'

import AsyncStorage from '../utils/asyncStorage'
import logger from '../logger/js-logger'
import { IS_LOGGED_IN, IS_NOTIFIED_OF_CLAIM, OLD_NOTIFICATIONS } from '../constants/localStorage'
import { onFeedReady } from '../userStorage/useFeedReady'
import { dailyClaimTime } from '../constants/cron'
import { bgFetchFrequency, CLAIM_NOTIFICATION, MAIN_TASK } from '../constants/bgFetch'

//TODO: how would this handle metamask accounts??

const options = {
  minimumFetchInterval: 15,
  forceAlarmManager: false,
  stopOnTerminate: false,
  startOnBoot: true,
  requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
  requiresCharging: false,
  requiresDeviceIdle: false,
  requiresBatteryNotLow: false,
  requiresStorageNotLow: false,
  enableHeadless: true,
  periodic: true,
}

const log = logger.child({ from: 'backgroundFetch' })

export const initBGFetch = once((goodWallet, userStorage) => {
  const task = async taskId => {
    if (taskId === MAIN_TASK) {
      log.info('[BackgroundFetch] taskId: ', taskId)

      const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN)
      const oldNotifications = await AsyncStorage.getItem(OLD_NOTIFICATIONS)

      log.info('isLoggedIn', isLoggedIn)

      if (!isLoggedIn) {
        return BackgroundFetch.finish(taskId)
      }

      const checkNotifications = async isInitialCall => {
        try {
          await hasConnection()
          await onFeedReady(userStorage)
        } catch (e) {
          return BackgroundFetch.finish(taskId)
        }

        const lastFeedCheck = userStorage.userProperties.get('lastSeenFeedNotification')
        const feed = await userStorage.getFeedPage(20, true)

        log.info('lastFeedCheck', lastFeedCheck)
        log.info('feed', feed)

        const hasNewPayment = (type, status) => {
          return type === 'receive' && status === 'completed'
        }

        const hasNewPaymentWithdraw = (type, status) => {
          return type === 'send' && status === 'completed'
        }

        const newFeeds = feed.filter(feedItem => {
          const { date, type, status } = feedItem
          const feedDate = moment(new Date(date)).valueOf()
          const isActual =
            (hasNewPayment(type, status) || hasNewPaymentWithdraw(type, status)) &&
            lastFeedCheck < feedDate &&
            !includes(oldNotifications, feedItem.id)
          return isActual && feedItem
        })

        userStorage.userProperties.safeSet('lastSeenFeedNotification', Date.now())

        log.info('new feed items', { newFeeds })

        log.info('pushing local notifications for feed items:', { total: newFeeds.length })

        newFeeds.map(async feed => {
          if (!isInitialCall) {
            PushNotification.localNotification({
              title: t`Payment from/to ${get(feed, 'data.counterPartyDisplayName', 'Unknown')} received/accepted`,
              message: t`G$ ${get(feed, 'data.amount', 0)}`,
              id: feed.id,
              userInfo: { id: feed.id },
            })
          } else {
            await AsyncStorage.setItem(OLD_NOTIFICATIONS, feed.id)
          }
        })
      }

      // Check notifications immediately on headless task call
      await checkNotifications(true)

      // Subscribe to feed update
      // userStorage.feedStorage.feedEvents.on('updated', checkNotifications)
    } else if (taskId === CLAIM_NOTIFICATION) {
      const { entitlement: dailyUBI } = await goodWallet.getClaimScreenStatsFuse()
      const notificationTimeout = new Date(dailyClaimTime.getTime() + bgFetchFrequency)
      const needToNotify = dailyUBI && Date.now() > dailyClaimTime && Date.now() < notificationTimeout

      const isNotified = await AsyncStorage.getItem(IS_NOTIFIED_OF_CLAIM)

      if (needToNotify && !isNotified) {
        PushNotification.localNotification({
          title: t`Your daily UBI Claim is ready`,
          message: t`You can claim your daily UBI`,
        })
        await AsyncStorage.setItem(IS_NOTIFIED_OF_CLAIM, true)
      }
    }
  }

  const androidHeadlessTask = async ({ taskId }) => {
    log.info('[BackgroundFetch HeadlessTask] start: ', taskId)
    await task(taskId)
  }

  const taskManagerErrorHandler = error => {
    log.info('[js] RNBackgroundFetch failed to start')
  }

  // eslint-disable-next-line require-await
  const waitUntil = async ms => new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), ms))

  // eslint-disable-next-line require-await
  const hasConnection = async () => Promise.race([Promise.all([goodWallet.ready, userStorage.ready]), waitUntil(10000)])

  BackgroundFetch.configure(options, task, taskManagerErrorHandler)
  BackgroundFetch.registerHeadlessTask(androidHeadlessTask)
  BackgroundFetch.scheduleTask({ taskId: MAIN_TASK })
  BackgroundFetch.scheduleTask({ taskId: CLAIM_NOTIFICATION })
})
