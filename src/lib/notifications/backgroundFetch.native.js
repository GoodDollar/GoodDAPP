import BackgroundFetch from 'react-native-background-fetch'
// eslint-disable-next-line import/default
import PushNotification from 'react-native-push-notification'
import moment from 'moment'
import { get, once } from 'lodash'

import AsyncStorage from '../utils/asyncStorage'
import logger from '../logger/js-logger'
import { IS_LOGGED_IN } from '../constants/localStorage'

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
    log.info('[BackgroundFetch] taskId: ', taskId)

    const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN)

    log.info('isLoggedIn', isLoggedIn)

    if (!isLoggedIn) {
      return BackgroundFetch.finish(taskId)
    }

    try {
      await hasConnection()
      await userStorage.registeredReady
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
      const { type, status, date } = feedItem
      const feedDate = moment(new Date(date)).valueOf()
      const newFeedItem =
        (hasNewPayment(type, status) || hasNewPaymentWithdraw(type, status)) && lastFeedCheck < feedDate
      return newFeedItem && feedItem
    })

    userStorage.userProperties.safeSet('lastSeenFeedNotification', Date.now())

    log.info('new feed items', { newFeeds })

    if (newFeeds.length === 0) {
      return BackgroundFetch.finish(taskId)
    }

    log.info('pushing local notifications for feed items:', { total: newFeeds.length })
    newFeeds.map(feed =>
      PushNotification.localNotification({
        title: `Payment from/to ${get(feed, 'data.counterPartyDisplayName', 'Unknown')} received/accepted`,
        message: `G$ ${get(feed, 'data.amount', 0)}`,
        id: feed.id,
        userInfo: { id: feed.id },
      }),
    )
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
  BackgroundFetch.scheduleTask({ taskId: 'org.gooddollar.bgfetch' })
})
