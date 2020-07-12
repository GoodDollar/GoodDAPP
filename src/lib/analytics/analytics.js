//@flow

// libraries
import amplitude from 'amplitude-js'
import { debounce, forEach, get, isFunction, isString } from 'lodash'
import * as Sentry from '@sentry/browser'

// utils
import API from '../../lib/API/api'
import Config from '../../config/config'
import logger, { ExceptionCategory } from '../../lib/logger/pino-logger'

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
export const CLAIM_GEO = 'claim-geo'
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
export const FV_INTRO = 'FV_INTRO'
export const FV_CAMERAPERMISSION = 'FV_CAMERAPERMISSION'
export const FV_GETREADY_ZOOM = 'FV_GETREADY_ZOOM'
export const FV_PROGRESS_ZOOM = 'FV_PROGRESS_ZOOM'
export const FV_ZOOMFAILED = 'FV_ZOOMFAILED'
export const FV_SUCCESS_ZOOM = 'FV_SUCCESS_ZOOM'
export const FV_TRYAGAIN_ZOOM = 'FV_TRYAGAIN_ZOOM'
export const FV_GENERALERROR = 'FV_GENERALERROR'
export const FV_WRONGORIENTATION = 'FV_WRONGORIENTATION'
export const FV_DUPLICATEERROR = 'FV_DUPLICATEERROR'
export const FV_TRYAGAINLATER = 'FV_TRYAGAINLATER'
export const FV_CANTACCESSCAMERA = 'FV_CANTACCESSCAMERA'

let Amplitude
const { mt: Mautic, FS, dataLayer: GoogleAnalytics } = global

const log = logger.child({ from: 'analytics' })
const { sentryDSN, amplitudeKey, version, env, network } = Config

const isFSEnabled = !!FS
const isSentryEnabled = !!sentryDSN
const isAmplitudeEnabled = !!amplitudeKey
const isGoogleAnalyticsEnabled = !!GoogleAnalytics

/** @private */
// eslint-disable-next-line require-await
const initAmplitude = async () => {
  const amp = () => amplitude.getInstance()

  if (!isAmplitudeEnabled) {
    return
  }

  return new Promise(resolve =>
    amp().init(amplitudeKey, null, null, () => {
      Amplitude = amp()
      resolve()
    })
  )
}

/** @private */
// eslint-disable-next-line require-await
const initFullStory = async () =>
  new Promise(resolve => {
    const { _fs_ready } = window

    Object.assign(window, {
      _fs_ready: () => {
        if (isFunction(_fs_ready)) {
          _fs_ready()
        }

        resolve()
      },
    })
  })

export const initAnalytics = async () => {
  // pre-initializing & preloading FS & Amplitude
  await Promise.all([isFSEnabled && initFullStory(), isAmplitudeEnabled && initAmplitude(amplitudeKey)])

  if (isAmplitudeEnabled) {
    const identity = new Amplitude.Identify().setOnce('first_open_date', new Date().toString())

    Amplitude.setVersionName(version)
    Amplitude.identify(identity)

    if (isFSEnabled) {
      const sessionUrl = FS.getCurrentSessionURL()

      // set session URL to user props once FS & Amplitude both initialized
      Amplitude.setUserProperties({ sessionUrl })
    }
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
    FS: isFSEnabled,
    Sentry: isSentryEnabled,
    Amplitude: isAmplitudeEnabled,
  })

  patchLogger()
}

/** @private */
const setUserEmail = email => {
  if (!email) {
    return
  }

  if (isAmplitudeEnabled) {
    Amplitude.setUserProperties({ email })
  }

  if (FS) {
    FS.setUserVars({
      email,
    })
  }

  if (isSentryEnabled) {
    Sentry.configureScope(scope => {
      const { _user } = scope

      scope.setUser({
        ...(_user || {}),
        email,
      })
    })
  }

  if (Mautic) {
    Mautic.userId = email
  }
}

/** @private */
const identifyWith = (email, identifier = null) => {
  if (isAmplitudeEnabled && identifier) {
    Amplitude.setUserId(identifier)
  }

  if (FS) {
    FS.identify(identifier, {
      appVersion: version,
    })
  }

  if (isSentryEnabled) {
    Sentry.configureScope(scope =>
      scope.setUser({
        id: identifier,
      })
    )
  }

  setUserEmail(email)

  log.debug(
    'Analytics services identified with:',
    { email, identifier },
    {
      FS: isFSEnabled,
      Mautic: !!email,
      Sentry: isSentryEnabled,
      Amplitude: isAmplitudeEnabled,
    }
  )
}

export const identifyOnUserSignup = async email => {
  setUserEmail(email)

  if (Mautic && email && 'production' === env) {
    await API.addMauticContact({ email })
  }

  log.debug(
    'Analytics services identified during new user signup:',
    { email },
    {
      FS: isFSEnabled,
      Mautic: !!email,
      Sentry: isSentryEnabled,
      Amplitude: isAmplitudeEnabled,
    }
  )
}

export const identifyWithSignedInUser = async (goodWallet: GoodWallet, userStorage: UserStorage) => {
  const identifier = goodWallet.getAccountForType('login')
  const email = await userStorage.getProfileFieldValue('email')

  log.debug('got identifiers', { identifier, email })

  identifyWith(email, identifier)
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

/**
 * fire event to google analytics
 *
 * @param {string} event Event name
 * @param {object} data Event properties (optional)
 * @return {void}
 */
export const fireGoogleAnalyticsEvent = (event, data = {}) => {
  if (!isGoogleAnalyticsEnabled) {
    return
  }

  GoogleAnalytics.push({ event, ...data })
}

const patchLogger = () => {
  const logError = logger.error.bind(logger)

  // for error logs if they happen frequently only log one
  const debounceFireEvent = debounce(fireEvent, 500, { leading: true })

  logger.error = (...args) => {
    const { Unexpected, Network, Human } = ExceptionCategory
    const [logContext, logMessage, eMsg = '', errorObj, extra = {}] = args
    let { dialogShown, category = Unexpected } = extra
    let errorToPassIntoLog = errorObj
    let categoryToPassIntoLog = category

    if (
      categoryToPassIntoLog === Unexpected &&
      ['connection', 'websocket', 'network'].some(str => eMsg.toLowerCase().includes(str))
    ) {
      categoryToPassIntoLog = Network
    }

    if (errorObj instanceof Error) {
      errorToPassIntoLog.message = `${logMessage}: ${errorObj.message}`
    } else {
      errorToPassIntoLog = new Error(logMessage)
    }

    if (isString(logMessage) && !logMessage.includes('axios')) {
      const logPayload = {
        unique: `${eMsg} ${logMessage} (${logContext.from})`,
        reason: logMessage,
        logContext,
        eMsg,
        dialogShown,
        category: categoryToPassIntoLog,
      }

      if (isFSEnabled) {
        const sessionUrlAtTime = FS.getCurrentSessionURL(true)

        Object.assign(logPayload, { sessionUrlAtTime })
      }

      debounceFireEvent(ERROR_LOG, logPayload)
    }

    if (env === 'test') {
      return
    }

    reportToSentry(
      errorToPassIntoLog,
      {
        logMessage,
        errorObj,
        logContext,
        eMsg,
        extra,
      },
      {
        dialogShown,
        category: categoryToPassIntoLog,
        level: categoryToPassIntoLog === Human ? 'info' : undefined,
      }
    )

    return logError(...args)
  }
}
