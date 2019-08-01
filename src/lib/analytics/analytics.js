//@flow
import logger from '../../lib/logger/pino-logger'
import Config from '../../config/config'

let Amplitude, FS, Rollbar
const log = logger.child({ from: 'analytics' })

export const initAnalytics = async (goodWallet: GoodWallet, userStorage: UserStorage) => {
  const identifier = goodWallet.getAccountForType('login')
  const emailOrId = (await userStorage.getProfileFieldValue('email')) || identifier
  if (global.Rollbar && Config.rollbarKey) {
    Rollbar = global.Rollbar
    global.Rollbar.configure({
      accessToken: Config.rollbarKey,
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        environment: Config.env,
        person: {
          id: emailOrId,
        },
      },
    })
  }

  if (global.amplitude && Config.amplitudeKey) {
    Amplitude = global.amplitude.getInstance()
    Amplitude.init(Config.amplitudeKey)
    Amplitude && Amplitude.setUserId(emailOrId)
  }

  if (global.FS) {
    FS = global.FS
    FS.identify(emailOrId, {})
  }
  log.debug('Initialized analytics:', {
    Amplitude: Amplitude !== undefined,
    FS: FS !== undefined,
    Rollbar: Rollbar !== undefined,
  })
}

export const fireEvent = (event: string, data: any = {}) => {
  if (Amplitude === undefined) {
    return
  }
  data.version = Config.version
  let res = Amplitude.logEvent(event, data)

  if (res === undefined) {
    log.warn('Amplitude event not sent', { event, data })
  } else {
    log.debug('fired event', { event, data })
  }
}
