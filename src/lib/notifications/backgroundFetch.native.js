import BackgroundFetch from 'react-native-background-fetch'
// eslint-disable-next-line import/default
import { once, values } from 'lodash'
import logger from '../logger/js-logger'
import { IS_LOGGED_IN } from '../constants/localStorage'
import AsyncStorage from '../utils/asyncStorage'
import { dailyClaimNotification, NotificationsCategories } from './backgroundActions'

// TODO: how would this handle metamask accounts??

const options = {
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

    switch (taskId) {
      case NotificationsCategories.CLAIM_NOTIFICATION:
        await dailyClaimNotification(userStorage, goodWallet)
        break
      default:
        break
    }
  }

  const taskManagerErrorHandler = error => {
    log.info('[js] RNBackgroundFetch failed to start', error)
  }

  BackgroundFetch.configure(options, task, taskManagerErrorHandler)
  values(NotificationsCategories).forEach(taskId => BackgroundFetch.scheduleTask({ taskId, periodic: true }))
})
