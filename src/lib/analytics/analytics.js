//@flow
import * as Sentry from '@sentry/browser'
import { debounce, forEach, get, invoke, isString } from 'lodash'

import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'

export const CLICK_BTN_GETINVITED = 'CLICK_BTN_GETINVITED'
export const CLICK_BTN_RECOVER_WALLET = 'CLICK_BTN_RECOVER_WALLET'
export const CLICK_BTN_CARD_ACTION = 'CLICK_BTN_CARD_ACTION'
export const CLICK_DELETE_WALLET = 'CLICK_DELETE_WALLET'
export const SIGNUP_STARTED = 'SIGNUP_STARTED'
export const SIGNIN_TORUS_SUCCESS = 'TORUS_SIGNIN_SUCCESS'
export const SIGNIN_SUCCESS = 'MAGICLINK_SUCCESS'
export const SIGNIN_FAILED = 'MAGICLINK_FAILED'
export const RECOVER_SUCCESS = 'RECOVER_SUCCESS'
export const RECOVER_FAILED = 'RECOVER_FAILED'
export const CLAIM_SUCCESS = 'CLAIM_SUCCESS'
export const CLAIM_FAILED = 'CLAIM_FAILED'
export const CLAIM_QUEUE = 'CLAIM_QUEUE_UPDATED'
export const CARD_OPEN = 'CARD_OPEN'
export const PROFILE_PRIVACY = 'PROFILE_PRIVACY'
export const PROFILE_IMAGE = 'PROFILE_IMAGE'
export const PROFILE_UPDATE = 'PROFILE_UPDATE'
export const PHRASE_BACKUP = 'PHRASE_BACKUP'
export const PHRASE_BACKUP_COPY = 'PHRASE_BACKUP_COPY'
export const ADDTOHOME = 'ADDTOHOME'
export const ADDTOHOME_LATER = 'ADDTOHOME_LATER' // desktop/chrome did user accept or reject the install prompt
export const ADDTOHOME_OK = 'ADDTOHOME_OK'
export const ADDTOHOME_REJECTED = 'ADDTOHOME_REJECTED'
export const ERROR_LOG = 'ERROR'
export const QR_SCAN = 'QR_SCAN'
export const APP_OPEN = 'APP_OPEN'
export const LOGOUT = 'LOGOUT'
export const CARD_SLIDE = 'CARD_SLIDE'

const FS = global.FS
const BugSnag = global.bugsnagClient
const Mautic = global.mt
const Rollbar = global.Rollbar
const Amplitude = invoke(global, 'amplitude.getInstance')

const log = logger.child({ from: 'analytics' })
const { sentryDSN, amplitudeKey, rollbarKey, version, env, network } = Config

const isSentryEnabled = !!sentryDSN
const isRollbarEnabled = !!(Rollbar && rollbarKey)
const isAmplitudeEnabled = !!(Amplitude && amplitudeKey)

export const initAnalytics = () => {
  if (isRollbarEnabled) {
    Rollbar.configure({
      accessToken: rollbarKey,
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        environment: env + network,
        codeVersion: version,
      },
    })
  }

  if (isAmplitudeEnabled) {
    const identity = new Amplitude.Identify().setOnce('first_open_date', new Date().toString())

    Amplitude.init(amplitudeKey)
    Amplitude.setVersionName(version)
    Amplitude.identify(identity)
  }

  if (isSentryEnabled) {
    Sentry.init({
      dsn: sentryDSN,
      environment: env,
    })

    Sentry.configureScope(scope => {
      scope.setTag('appVersion', version)
      scope.setTag('networkUsed', network)
    })
  }

  log.debug('Initialized analytics:', {
    Sentry: isSentryEnabled,
    Rollbar: isRollbarEnabled,
    Amplitude: isAmplitudeEnabled,
  })

  patchLogger()
}

export const identifyWith = (email, identifier = null) => {
  const emailOrId = email || identifier

  if (BugSnag) {
    BugSnag.user = {
      id: identifier,
      email: emailOrId,
    }
  }

  if (isRollbarEnabled) {
    Rollbar.configure({
      payload: {
        person: {
          id: emailOrId,
          identifier,
        },
      },
    })
  }

  if (isAmplitudeEnabled) {
    if (email) {
      Amplitude.setUserId(email)
    }

    if (identifier) {
      Amplitude.setUserProperties({ identifier })
    }
  }

  if (FS) {
    FS.identify(emailOrId, {
      appVersion: version,
    })
  }

  if (isSentryEnabled) {
    Sentry.configureScope(scope =>
      scope.setUser({
        id: identifier,
        email: email,
      })
    )
  }

  if (Mautic && email) {
    Mautic.userId = email
  }

  log.debug(
    'Analytics services identified with:',
    { email, identifier },
    {
      FS: !!FS,
      Mautic: !!email,
      BugSnag: !!BugSnag,
      Sentry: isSentryEnabled,
      Rollbar: isRollbarEnabled,
      Amplitude: isAmplitudeEnabled,
    }
  )
}

export const identifyWithCurrentUser = async (goodWallet: GoodWallet, userStorage: UserStorage) => {
  const identifier = goodWallet.getAccountForType('login')
  const email = await userStorage.getProfileFieldValue('email')

  log.debug('got identifiers', { identifier, email })

  return identifyWith(email, identifier)
}

export const reportToSentry = (error, extra = {}, tags = {}) => {
  if (!isSentryEnabled) {
    return
  }

  Sentry.configureScope(scope => {
    // set extra
    forEach(extra, (value, key) => {
      scope.setExtra(key, value)
    })

    // set tags
    forEach(tags, (value, key) => {
      scope.setTag(key, value)
    })

    Sentry.captureException(error)
  })
}

export const fireEvent = (event: string, data: any = {}) => {
  if (!isAmplitudeEnabled) {
    return
  }

  if (!Amplitude.logEvent(event, data)) {
    log.warn('Amplitude event not sent', { event, data })
    return
  }

  log.debug('fired event', { event, data })
}

export const fireMauticEvent = (data: any = {}) => {
  if (!Mautic) {
    return
  }

  const { userId } = Mautic
  let eventData = data

  if (userId) {
    // do not mutate source params
    eventData = { ...data, email: userId }
  }

  Mautic('send', 'pageview', eventData)
}

/**
 * Create code from navigation active route and call `fireEvent`
 * @param {object} route
 */
export const fireEventFromNavigation = route => {
  const { routeName: key, params } = route
  const action = get(params, 'action', 'GOTO')
  const code = `${action}_${key}`.toUpperCase()

  fireEvent(code)
}

const patchLogger = () => {
  const logError = logError.error.bind(logger)

  // for error logs if they happen frequently only log one
  const debounceFireEvent = debounce(fireEvent, 500, { leading: true })

  logger.error = (...args) => {
    const [logContext, logMessage, eMsg, errorObj, ...rest] = args

    if (isString(logMessage) && !logMessage.includes('axios')) {
      debounceFireEvent(ERROR_LOG, {
        unique: `${eMsg} ${logMessage} (${logContext.from})`,
        reason: logMessage,
        logContext,
        eMsg,
      })
    }

    if (env === 'test') {
      return
    }

    if (BugSnag) {
      const { from } = logContext || {}

      BugSnag.notify(logMessage, {
        context: from,
        groupingHash: from,
        metaData: { logMessage, eMsg, errorObj, rest },
      })
    }

    if (isRollbarEnabled) {
      Rollbar.error(logMessage, errorObj, { logContext, eMsg, rest })
    }

    let errorToPassIntoLog = errorObj

    if (errorObj instanceof Error) {
      errorToPassIntoLog.message = `${logMessage}: ${errorObj.message}`
    } else {
      errorToPassIntoLog = new Error(logMessage)
    }

    reportToSentry(errorToPassIntoLog, {
      logMessage,
      errorObj,
      logContext,
      eMsg,
      rest,
    })

    return logError(...args)
  }
}
