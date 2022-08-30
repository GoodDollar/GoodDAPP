import BackgroundFetch from 'react-native-background-fetch'
// eslint-disable-next-line import/default
import { once, values } from 'lodash'
import logger from '../logger/js-logger'
import { IS_LOGGED_IN } from '../constants/localStorage'
import AsyncStorage from '../utils/asyncStorage'
// eslint-disable-next-line import/named
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

export const initBGFetch = once(async (goodWallet, userStorage) => {
  const onEvent = async taskId => {
    const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN)

    log.info('RNBackgroundFetch event', { isLoggedIn, taskId })

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

    BackgroundFetch.finish(taskId)
  }

  const onTimeout = taskId => {
    log.info('[js] RNBackgroundFetch task timeout', taskId)
    BackgroundFetch.finish(taskId)
  }

  const scheduleTask = async taskId => {
    const result = await BackgroundFetch.scheduleTask({ taskId, delay: 0, ...options })

    if (!result) {
      throw new Error(`BackgroundFetch scheduleTask failed, taskId: ${taskId}`)
    }
  }

  try {
    const configureStatus = await BackgroundFetch.configure(options, onEvent, onTimeout)

    if (configureStatus !== BackgroundFetch.STATUS_AVAILABLE) {
      throw new Error(`BackgroundFetch configure failed with status ${configureStatus}`)
    }

    await Promise.all(values(NotificationsCategories).map(scheduleTask))
  } catch (e) {
    log.error('initBGFetch failed', e.message, e)

    throw e
  }
})
