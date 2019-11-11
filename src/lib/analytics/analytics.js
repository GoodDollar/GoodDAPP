//@flow
import _debounce from 'lodash/debounce'
import logger from '../../lib/logger/pino-logger'
import Config from '../../config/config'

export const CLICK_BTN_GETINVITED = 'CLICK_BTN_GETINVITED'
export const CLICK_BTN_RECOVER_WALLET = 'CLICK_BTN_RECOVER_WALLET'
export const CLICK_BTN_CARD_ACTION = 'CLICK_BTN_CARD_ACTION'
export const CLICK_DELETE_WALLET = 'CLICK_DELETE_WALLET'
export const SIGNIN_SUCCESS = 'MAGICLINK_SUCCESS'
export const SIGNIN_FAILED = 'MAGICLINK_FAILED'
export const RECOVER_SUCCESS = 'RECOVER_SUCCESS'
export const RECOVER_FAILED = 'RECOVER_FAILED'
export const CLAIM_SUCCESS = 'CLAIM_SUCCESS'
export const CLAIM_FAILED = 'CLAIM_FAILED'
export const CARD_OPEN = 'CARD_OPEN'
export const PROFILE_PRIVACY = 'PROFILE_PRIVACY'
export const PROFILE_IMAGE = 'PROFILE_IMAGE'
export const PROFILE_UPDATE = 'PROFILE_UPDATE'
export const PHRASE_BACKUP = 'PHRASE_BACKUP'
export const PHRASE_BACKUP_COPY = 'PHRASE_BACKUP_COPY'
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

export const initAnalytics = async (goodWallet: GoodWallet, userStorage: UserStorage) => {
  const identifier = goodWallet && goodWallet.getAccountForType('login')
  const email = userStorage && (await userStorage.getProfileFieldValue('email'))
  const emailOrId = email || identifier

  if (global.bugsnagClient) {
    global.bugsnagClient.user = {
      id: identifier,
      email: emailOrId,
    }
  }

  if (global.Rollbar && Config.rollbarKey) {
    Rollbar = global.Rollbar
    global.Rollbar.configure({
      accessToken: Config.rollbarKey,
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        environment: Config.env + Config.network,
        codeVersion: Config.version,
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
    Amplitude.setVersionName(Config.version)
    if (Amplitude) {
      const created = new global.amplitude.Identify().setOnce('first_open_date', new Date().toString())
      if (email) {
        Amplitude.setUserId(email)
      }
      Amplitude.identify(created)
      if (identifier) {
        Amplitude.setUserProperties({ identifier })
      }
    }
  }

  if (global.FS) {
    FS = global.FS
    if (emailOrId) {
      FS.identify(emailOrId, {})
    }
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

  let res = Amplitude.logEvent(event, data)

  if (res === undefined) {
    log.warn('Amplitude event not sent', { event, data })
  } else {
    log.debug('fired event', { event, data })
  }
}

/**
 * Create code from navigation active route and call `fireEvent`
 * @param {object} route
 */
export const fireEventFromNavigation = route => {
  const key = route.routeName
  const action = route.params && route.params.action ? `${route.params.action}` : 'GOTO'

  const code = `${action}_${key}`.toUpperCase()

  fireEvent(code)
}

//for error logs if they happen frequently only log one
const debounceFireEvent = _debounce(fireEvent, 500, { leading: true })

const patchLogger = () => {
  let error = global.logger.error
  global.logger.error = function() {
    let [logContext, logMessage, eMsg, errorObj, ...rest] = arguments
    if (logMessage && typeof s === 'string' && logMessage.indexOf('axios') == -1) {
      debounceFireEvent(ERROR_LOG, { reason: logMessage || eMsg, logContext })
    }
    if (global.bugsnagClient && Config.env !== 'test') {
      global.bugsnagClient.notify(logMessage, {
        context: logContext && logContext.from,
        metaData: { logMessage, eMsg, errorObj, rest },
        groupingHash: logContext && logContext.from,
      })
    }
    if (global.Rollbar && Config.env !== 'test') {
      global.Rollbar.error(logMessage, errorObj, { logContext, eMsg, rest })
    }
    return error.apply(global.logger, arguments)
  }
}
