import BackgroundFetch from 'react-native-background-fetch'
// eslint-disable-next-line import/default
import { once, pickBy, values } from 'lodash'
import { useCallback, useEffect } from 'react'
import logger from '../logger/js-logger'
import { useUserStorage, useWallet } from '../wallet/GoodWalletProvider'
import { fireEvent, NOTIFICATION_ERROR, NOTIFICATION_SENT } from '../analytics/analytics'
import { noopAsync } from '../utils/async'
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

const DEFAULT_TASK = 'BackgroundFetch'
const defaultTaskProcessor = noopAsync
const log = logger.child({ from: 'backgroundFetch' })

const onTimeout = taskId => {
  log.info('[js] RNBackgroundFetch task timeout', taskId)
  BackgroundFetch.finish(taskId)
}

const scheduleTask = async taskId => {
  const result = await BackgroundFetch.scheduleTask({ taskId, delay: 15 * 60 * 1000, ...options })

  if (!result) {
    throw new Error(`BackgroundFetch scheduleTask failed, taskId: ${taskId}`)
  }
}

const initialize = once(async onEvent => {
  try {
    const configureStatus = await BackgroundFetch.configure(options, onEvent, onTimeout)

    if (configureStatus !== BackgroundFetch.STATUS_AVAILABLE) {
      throw new Error(`BackgroundFetch configure failed with status ${configureStatus}`)
    }

    await Promise.all(values(NotificationsCategories).map(scheduleTask))
  } catch (e) {
    const { message: error } = e

    log.error('initBGFetch failed', error, e)
    fireEvent(NOTIFICATION_ERROR, { error })

    throw e
  }
})

export const useBackgroundFetch = (auto = false) => {
  const goodWallet = useWallet()
  const userStorage = useUserStorage()

  const runTask = useCallback(
    // eslint-disable-next-line require-await
    async taskId => {
      switch (taskId) {
        case DEFAULT_TASK:
          return defaultTaskProcessor()
        case NotificationsCategories.CLAIM_NOTIFICATION:
          return dailyClaimNotification(userStorage, goodWallet)
        default:
          throw new Error('Unknown / unsupported background fetch task received')
      }
    },
    [userStorage, goodWallet],
  )

  const initBGFetch = useCallback(
    () =>
      initialize(async taskId => {
        log.info('RNBackgroundFetch event', { taskId })

        try {
          const payload = await runTask(taskId)

          payload && fireEvent(NOTIFICATION_SENT, { payload })
        } catch (e) {
          const { message: error, payload } = e

          log.error('Failed to process background fetch task', error, e, { payload })
          fireEvent(NOTIFICATION_ERROR, pickBy({ payload, error }))
        }

        BackgroundFetch.finish(taskId)
      }),
    [runTask],
  )

  useEffect(() => {
    if (auto) {
      initBGFetch()
    }
  }, [auto, initBGFetch])

  return initBGFetch
}
