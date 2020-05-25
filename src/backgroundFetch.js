import BackgroundFetch from 'react-native-background-fetch'
import PushNotification from 'react-native-push-notification'
import { AsyncStorage } from 'react-native'
import moment from 'moment'
import logger from '../src/lib/logger/pino-logger'
import { IS_LOGGED_IN } from './lib/constants/localStorage'
import userStorage from './lib/gundb/UserStorage'
import {
  checkGunConnection,
  checkWalletAvailable,
  checkWalletConnection,
  checkWalletReady,
} from './lib/utils/checkConnections'

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

  const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN).then(JSON.parse)

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
    })
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

const hasConnection = () => {
  let stop = false

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (stop) {
        return
      }

      stop = true
      log.info('STOPPED')
      reject()
    }, 10000)

    if (stop) {
      return
    }

    const isConnected = () => {
      if (!checkWalletReady()) {
        return setTimeout(isConnected, 200)
      }

      if (!checkWalletConnection()) {
        return setTimeout(isConnected, 200)
      }

      if (!checkWalletAvailable()) {
        return setTimeout(isConnected, 200)
      }

      if (!checkGunConnection()) {
        return setTimeout(isConnected, 200)
      }

      log.info('HAS CONNECTION')
      stop = true
      resolve()
    }

    isConnected()
  })
}
