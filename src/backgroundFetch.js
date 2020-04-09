import BackgroundFetch from 'react-native-background-fetch'
import PushNotification from 'react-native-push-notification'
import { AsyncStorage } from 'react-native'
import moment from 'moment'
import Config from './config/config'
import { IS_LOGGED_IN } from './lib/constants/localStorage'
import goodWallet from './lib/wallet/GoodWallet'
import userStorage from './lib/gundb/UserStorage'

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

const task = async taskId => {
  console.log('[BackgroundFetch] taskId: ', taskId)

  const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN).then(JSON.parse)

  console.log('isLoggedIn', isLoggedIn)

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
  const beginningOfDayMillis = moment(lastFeedCheck)
    .startOf('day')
    .valueOf()

  console.log('lastFeedCheck', lastFeedCheck)
  console.log('feed', feed)

  const hasNewPayment = (type, status) => {
    return type === 'receive' && status === 'completed'
  }

  const hasNewPaymentWithdraw = (type, status) => {
    return type === 'send' && status === 'completed'
  }

  const newFeeds = feed.filter(feedItem => {
    const dayMillis = moment(feedItem.date)
      .startOf('day')
      .valueOf()
    const { type, status } = feedItem
    const newFeedItem =
      (hasNewPayment(type, status) || hasNewPaymentWithdraw(type, status)) && dayMillis >= beginningOfDayMillis
    return newFeedItem && feedItem
  })

  await userStorage.feed.put({
    lastSeenDate: Date.now(),
  })

  if (!newFeeds) {
    return BackgroundFetch.finish(taskId)
  }

  newFeeds.map(feed =>
    PushNotification.localNotification({
      title: `${feed.type} operation is ${feed.status}`,
      message: 'Now get back to work',
    })
  )
}

const androidHeadlessTask = async ({ taskId }) => {
  console.log('[BackgroundFetch HeadlessTask] start: ', taskId)
  await task(taskId)
}

const taskManagerErrorHandler = error => {
  console.log('[js] RNBackgroundFetch failed to start')
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
      console.log('STOPPED')
      reject()
    }, 10000)

    if (stop) {
      return
    }

    const isConnected = async () => {
      const isReady = await Promise.all([goodWallet.ready, userStorage.ready])
        .then(_ => true)
        .catch(_ => false)

      console.log('isReady', isReady)

      if (!isReady) {
        return setTimeout(isConnected, 200)
      }

      const isWalletConnected = goodWallet.wallet.currentProvider.connected

      console.log('isWalletConnected', isWalletConnected)

      if (!isWalletConnected) {
        if (!goodWallet.wallet.currentProvider.reconnecting) {
          goodWallet.wallet.currentProvider.reconnect()
        }

        return setTimeout(isConnected, 200)
      }

      const isWalletAvailable = await goodWallet
        .balanceOf()
        .then(_ => true)
        .catch(_ => false)

      console.log('isWalletAvailable', isWalletAvailable)

      if (!isWalletAvailable) {
        return setTimeout(isConnected, 200)
      }

      const instanceGun = userStorage.gun._
      const connection = instanceGun.opt.peers[Config.gunPublicUrl]

      console.log('gunConnection', connection)

      const isGunConnected = connection && connection.wire && connection.wire.readyState === connection.wire.OPEN

      if (!isGunConnected) {
        return setTimeout(isConnected, 200)
      }

      console.log('HAS CONNECTION')
      stop = true
      resolve()
    }

    isConnected()
  })
}
