//@flow
import logger from '../../lib/logger/pino-logger'
import Config from '../../config/config'

export const CLICK_BTN_SIGNIN = 'CLICK_BTN_SIGNIN'
export const CLICK_BTN_RECOVER_WALLET = 'CLICK_BTN_RECOVER_WALLET'
export const CLICK_BTN_CARD_ACTION = 'CLICK_BTN_CARD_ACTION'
export const CLICK_DELETE_WALLET = 'CLICK_DELETE_WALLET'
export const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS'
export const RECOVER_SUCCESS = 'RECOVER_SUCCESS'
export const CLAIM_SUCCESS = 'CLAIM_SUCCESS'
export const CARD_OPEN = 'CARD_OPEN'
export const PROFILE_PRIVACY = 'PROFILE_PRIVACY'
export const PROFILE_IMAGE = 'PROFILE_IMAGE'
export const PROFILE_UPDATE = 'PROFILE_UPDATE'
export const PHRASE_BACKUP = 'PHRASE_BACKUP'
export const ADDTOHOME = 'ADDTOHOME'
export const ADDTOHOME_LATER = 'ADDTOHOME_LATER'

//desktop/chrome did user accept or reject the install prompt
export const ADDTOHOME_OK = 'ADDTOHOME_OK'
export const ADDTOHOME_REJECTED = 'ADDTOHOME_REJECTED'
export const ERROR_LOG = 'ERROR'
export const QR_SCAN = 'QR_SCAN'
export const APP_OPEN = 'APP_OPEN'
export const LOGOUT = 'LOGOUT'
export const CARD_SLIDE = 'CARD_SLIDE'

let Amplitude, FS, Rollbar

const log = logger.child({ from: 'analytics' })

export const initAnalytics = async (goodWallet: GoodWallet, userStorage: UserStorage, logger) => {
  const identifier = goodWallet.getAccountForType('login')
  const email = await userStorage.getProfileFieldValue('email')
  const emailOrId = email || identifier
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
          identifier,
        },
      },
    })
  }

  if (global.amplitude && Config.amplitudeKey) {
    Amplitude = global.amplitude.getInstance()
    Amplitude.init(Config.amplitudeKey)
    if (Amplitude) {
      const created = new Amplitude.Identify().setOnce('sign_up_date', new Date().toString())
      if (email) {
        Amplitude.setUserId(email)
      }
      Amplitude.setUserProperties({ identifier })
      Amplitude.identify(created)
    }
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

  patchLogger()
}

export const fireEvent = (event: string, data: any = {}) => {
  if (Amplitude === undefined) {
    return
  }

  switch (event) {
    case ERROR_LOG:
      data = { reason: data && data[1] ? data[1] : '' }
      break

    default:
      break
  }

  data.version = Config.version
  let res = Amplitude.logEvent(event, data)

  if (res === undefined) {
    log.warn('Amplitude event not sent', { event, data })
  } else {
    log.debug('fired event', { event, data })
  }
}

/**
 * Create code from navigation active route and call `fireEvent`
 * @param {object} navigation
 */
export const fireEventFromNavigation = navigation => {
  const route = navigation.state.routes[navigation.state.index]
  const key = route.key
  const action = route.params && route.params.action ? `${route.params.action}` : 'GOTO'
  const code = `${action}_${key}`.toUpperCase()

  fireEvent(code)
}

const patchLogger = () => {
  let error = global.logger.error
  global.logger.error = function() {
    fireEvent('ERROR_LOG', arguments)
    if (global.Rollbar && Config.env !== 'test') {
      global.Rollbar.error.apply(global.Rollbar, arguments)
    }
    return error.apply(global.logger, arguments)
  }
}
