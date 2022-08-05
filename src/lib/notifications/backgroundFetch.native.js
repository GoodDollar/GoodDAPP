import BackgroundFetch from 'react-native-background-fetch'
// eslint-disable-next-line import/default
import { once } from 'lodash'
import logger from '../logger/js-logger'
import { IS_LOGGED_IN } from '../constants/localStorage'
import { CLAIM_NOTIFICATION } from '../constants/bgFetch'
import AsyncStorage from '../utils/asyncStorage'
import { dailyClaimNotification } from './backgroundActions'

//TODO: how would this handle metamask accounts??

const options = {
  minimumFetchInterval: 0,
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
    const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN)

    log.info('isLoggedIn', isLoggedIn)

    if (!isLoggedIn) {
      return
    }

    if (taskId === CLAIM_NOTIFICATION) {
      await dailyClaimNotification(userStorage, goodWallet)
    }
  }

  const taskManagerErrorHandler = error => {
    log.info('[js] RNBackgroundFetch failed to start', error)
  }

  BackgroundFetch.configure(options, task, taskManagerErrorHandler)

  // BackgroundFetch.scheduleTask({ taskId: FEED_NOTIFICATIONS, periodic: true })
  BackgroundFetch.scheduleTask({ taskId: CLAIM_NOTIFICATION, periodic: true })
})
