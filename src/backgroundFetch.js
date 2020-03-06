import BackgroundFetch from 'react-native-background-fetch'
import PushNotification from 'react-native-push-notification'
import { AsyncStorage } from 'react-native'
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

  if (!isLoggedIn) {
    return BackgroundFetch.finish(taskId)
  }

  await Promise.all([goodWallet.ready, userStorage.ready])

  const isWalletConnected = goodWallet.wallet.currentProvider.connected

  if (!isWalletConnected) {
    return BackgroundFetch.finish(taskId)
  }

  const isWalletAvailable = await goodWallet
    .balanceOf()
    .then(_ => true)
    .catch(_ => false)

  if (!isWalletAvailable) {
    return BackgroundFetch.finish(taskId)
  }

  await userStorage.feed.put({
    lastSeenDate: Date.now(),
  })

  const feed = await userStorage.getAllFeed()
  const lastFeedCheck = await userStorage.feed.get('lastSeenDate')

  const hasNewPayment = feed.some(({ type, status, data }) => {
    const isPaymentEvent = type === 'receive'
      && status === 'completed'
      && data.receiptData === 'Transfer'

    if (!isPaymentEvent) {
      return false
    }

    const date = new Date(window.coso[1].date).getTime()
    return date > lastFeedCheck
  })

  const hasNewPaymentWithdraw = feed.some(({ type, status, data }) => {
    const isPaymentWithdraw = type === 'send'
      && status === 'completed'
      && data.otplData && data.otplData.name === 'PaymentWithdraw'

    if (!isPaymentWithdraw) {
      return false
    }

    const date = new Date(window.coso[1].date).getTime()
    return date > lastFeedCheck
  })

  if (!hasNewPayment && !hasNewPaymentWithdraw) {
    return BackgroundFetch.finish(taskId)
  }

  PushNotification.localNotification({
    title: 'YO! This is a notification',
    message: 'Now get back to work',
  })
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
