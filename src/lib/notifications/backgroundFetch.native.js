import BackgroundFetch from 'react-native-background-fetch'
import PushNotification from 'react-native-push-notification'
import moment from 'moment'
import AsyncStorage from '../utils/asyncStorage'
import logger from '../logger/pino-logger'
import { IS_LOGGED_IN } from '../constants/localStorage'
import userStorage from '../gundb/UserStorage'
import goodWallet from '../wallet/GoodWallet'

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

const task = async taskId => {
  log.info('[BackgroundFetch] taskId: ', taskId)

  const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN)

  log.info('isLoggedIn', isLoggedIn)

  if (!isLoggedIn) {
    return BackgroundFetch.finish(taskId)
  }

  try {
    await hasConnection()
  } catch (e) {
    return BackgroundFetch.finish(taskId)
  }

  const lastFeedCheck = await userStorage.feed.get('lastSeenDate')
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
    const feedDate = moment(date).valueOf()
    const newFeedItem = (hasNewPayment(type, status) || hasNewPaymentWithdraw(type, status)) && lastFeedCheck < feedDate
    return newFeedItem && feedItem
  })

  await userStorage.feed.put({
    lastSeenDate: Date.now(),
  })

  log.info('newFeed', newFeeds)

  if (!newFeeds) {
    return BackgroundFetch.finish(taskId)
  }

  newFeeds.map(feed =>
    PushNotification.localNotification({
      title: `Payment from/to ${feed.data.counterPartyDisplayName} received/accepted`,
      message: `G$ ${feed.data.amount}`,
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

BackgroundFetch.configure(options, task, taskManagerErrorHandler)
BackgroundFetch.registerHeadlessTask(androidHeadlessTask)
BackgroundFetch.scheduleTask({ taskId: 'org.gooddollar.bgfetch' })

// eslint-disable-next-line require-await
const waitUntil = async ms => new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out')), ms))

// eslint-disable-next-line require-await
const hasConnection = async () => Promise.race([Promise.all([goodWallet.ready, userStorage.ready]), waitUntil(10000)])
