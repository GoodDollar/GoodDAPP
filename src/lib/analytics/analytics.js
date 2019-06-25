//@flow
import logger from '../../lib/logger/pino-logger'
import Config from '../../config/config'

let Amplitude, FS
const log = logger.child({ from: 'analytics' })

export const initAnalytics = async (goodWallet: GoodWallet, userStorage: UserStorage) => {
  const identifier = goodWallet.getAccountForType('login')
  const emailOrId = (await userStorage.getProfileFieldValue('email')) || identifier
  if (global.Rollbar && Config.env !== 'test') {
    global.Rollbar.configure({
      payload: {
        person: {
          id: emailOrId
        }
      }
    })
  }
  FS = window.FS
  Amplitude = window.amplitude && window.amplitude.getInstance()
  FS && FS.identify(emailOrId, {})
  Amplitude && Amplitude.setUserId(emailOrId)
  log.debug('Initialized analytics:', { Amplitude: Amplitude !== undefined, FS: FS !== undefined })
}

export const fireEvent = (event: string, data: {}) => {
  if (Amplitude === undefined) {
    return
  }
  let res = Amplitude.logEvent(event, data)

  if (res === undefined) {
    log.warn('Amplitude event not sent', { event, data })
  } else {
    log.debug('fired event', { event, data })
  }
}
