// @flow

// libraries
import amplitude from 'amplitude-js'
import { assign, debounce, forIn, get, isEmpty, isError, isFunction, isString, remove, toLower } from 'lodash'
import * as Sentry from '@sentry/browser'

// utils
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import { ExceptionCategory } from '../../lib/logger/exceptions'
import { isMobileReactNative } from '../../lib/utils/platform'

export const CLICK_BTN_GETINVITED = 'CLICK_BTN_GETINVITED'
export const CLICK_BTN_RECOVER_WALLET = 'CLICK_BTN_RECOVER_WALLET'
export const CLICK_BTN_CARD_ACTION = 'CLICK_BTN_CARD_ACTION'
export const CLICK_DELETE_WALLET = 'CLICK_DELETE_WALLET'
export const SIGNUP_SELECTED = 'SIGNUP_SELECTED'
export const SIGNIN_SELECTED = 'SIGNIN_SELECTED'
export const SIGNUP_METHOD_SELECTED = 'SIGNUP_METHOD_SELECTED'
export const SIGNIN_METHOD_SELECTED = 'SIGNIN_METHOD_SELECTED'
export const SIGNUP_STARTED = 'SIGNUP_STARTED'
export const SIGNUP_EXISTS = 'SIGNUP_EXISTS'
export const SIGNUP_EXISTS_LOGIN = 'SIGNUP_EXISTS_LOGIN'
export const SIGNUP_EXISTS_CONTINUE = 'SIGNUP_EXISTS_CONTINUE'
export const SIGNUP_RETRY_SMS = 'SIGNUP_RETRY_SMS'
export const SIGNUP_RETRY_EMAIL = 'SIGNUP_RETRY_EMAIL'
export const SIGNIN_NOTEXISTS_SIGNUP = 'SIGIN_NOEXISTS_SIGNUP'
export const SIGNIN_NOTEXISTS_LOGIN = 'SIGNIN_NOTEXISTS_LOGIN'
export const SIGNIN_TORUS_SUCCESS = 'TORUS_SIGNIN_SUCCESS'
export const TORUS_SUCCESS = 'TORUS_SUCCESS'
export const TORUS_FAILED = 'TORUS_FAILED'
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
export const GOTO_MARKET = 'GOTO_MARKET'
export const GOTO_MARKET_POPUP = 'GOTO_MARKET_POPUP'
export const ERROR_LOG = 'ERROR'
export const QR_SCAN = 'QR_SCAN'
export const APP_OPEN = 'APP_OPEN'
export const LOGOUT = 'LOGOUT'
export const CARD_SLIDE = 'CARD_SLIDE'
export const FV_INTRO = 'FV_INTRO'
export const FV_CAMERAPERMISSION = 'FV_CAMERAPERMISSION'
export const FV_INSTRUCTIONS = 'FV_INSTRUCTIONS'
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
export const INVITE_SHARE = 'INVITE_SHARE' //user pressed on any of the sharing options
export const INVITE_JOIN = 'INVITE_JOIN' //user joined after he was invited
export const INVITE_BOUNTY = 'INVITE_BOUNTY' //user collected his bounties

const savedErrorMessages = new WeakMap()

const log = logger.child({ from: 'analytics' })
const { sentryDSN, amplitudeKey, version, env, network, phase } = Config

/** @private */
// eslint-disable-next-line require-await
const initAmplitude = async key => {
  if (!isAmplitudeEnabled) {
    return
  }

  return new Promise(resolve => {
    const onError = () => resolve(false)
    const onSuccess = () => resolve(true)

    Amplitude.init(key, null, { includeUtm: true, includeReferrer: true, onError }, onSuccess)
  })
}

/** @private */
const fullStoryState = new class {
  ready = false

  constructor() {
    const { _fs_ready } = window // eslint-disable-line camelcase

    this.promise = new Promise(resolve =>
      assign(window, {
        _fs_ready: () => {
          if (isFunction(_fs_ready)) {
            _fs_ready()
          }

          this.ready = true
          resolve()
        },
      }),
    )
  }

  onReady(callback) {
    const { promise } = this

    return promise.then(callback)
  }
}()

const Amplitude = amplitude.getInstance()
const { mt: Mautic, FS, dataLayer: GoogleAnalytics } = global
let isFSEnabled, isSentryEnabled, isGoogleAnalyticsEnabled, isMauticEnabled, isAmplitudeEnabled

export const initAnalytics = async () => {
  const isFSAvailable = !!FS

  isFSEnabled = isFSAvailable && Config.env === 'production'
  isSentryEnabled = !!sentryDSN
  isAmplitudeEnabled = !!amplitudeKey
  isGoogleAnalyticsEnabled = !!GoogleAnalytics
  isMauticEnabled = !!Mautic

  if (isAmplitudeEnabled) {
    log.info('preinitializing Amplitude with license key')

    await initAmplitude(amplitudeKey).then(success => {
      isAmplitudeEnabled = success
      log.info('License sent to Amplitude', { success })
    })
  }

  fullStoryState.onReady(() => {
    if (isFSAvailable && !isFSEnabled && isFunction(FS.shutdown)) {
      FS.shutdown()
    }
  })

  if (isAmplitudeEnabled) {
    const identity = new Amplitude.Identify().setOnce('first_open_date', new Date().toString())

    identity.append('phase', String(phase))
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
      scope.setTag('phase', phase)
    })
  }

  log.debug('available analytics:', {
    FS: isFSEnabled,
    Sentry: isSentryEnabled,
    Amplitude: isAmplitudeEnabled,
    Mautic: isMauticEnabled,
    Google: isGoogleAnalyticsEnabled,
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

  if (isFSEnabled) {
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

export const identifyWith = (email, identifier = null) => {
  if (isAmplitudeEnabled && identifier) {
    Amplitude.setUserId(identifier)
  }

  if (isFSEnabled) {
    FS.identify(identifier, {
      appVersion: version,
      phase,
    })
  }

  if (isSentryEnabled) {
    Sentry.configureScope(scope =>
      scope.setUser({
        id: identifier,
      }),
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
    },
  )
}

//eslint-disable-next-line
export const identifyOnUserSignup = async email => {
  setUserEmail(email)

  //disable for now, to see if it solves the duplicate contact issue
  // if (email && ['staging', 'production'].includes(env)) {
  //   await API.addMauticContact({ email })
  // }

  log.debug(
    'Analytics services identified during new user signup:',
    { email },
    {
      FS: isFSEnabled,
      Mautic: isMauticEnabled && !!email,
      Sentry: isSentryEnabled,
      Amplitude: isAmplitudeEnabled,
    },
  )
}

export const reportToSentry = (error, extra = {}, tags = {}) => {
  if (!isSentryEnabled) {
    return
  }

  const { logContext, eMsg } = extra
  const fingerprint = [get(logContext, 'from', '{{ default }}'), eMsg]

  Sentry.configureScope(scope => {
    const extraTags = []
    const tagsSet = []

    // set extra
    forIn(extra, (value, key) => {
      extraTags.push(key)
      scope.setExtra(key, value)
    })

    // set tags
    forIn(tags, (value, key) => {
      tagsSet.push(key)
      scope.setTag(key, value)
    })

    scope.setFingerprint(fingerprint)
    Sentry.captureException(error)

    log.debug('Captured Sentry exception', { fingerprint, tags: tagsSet, extraTags })
  })
}

export const fireEvent = (event: string, data: any = {}) => {
  if (isAmplitudeEnabled) {
    if (!Amplitude.logEvent(event, data)) {
      log.warn('Amplitude event not sent', { event, data })
    }
  }

  //fire all events on  GA also
  let gaEvent
  if (isGoogleAnalyticsEnabled) {
    gaEvent = convertToGA(data)
    gaEvent.eventAction = event
    fireGoogleAnalyticsEvent('Analytics_event', gaEvent)
  }

  log.debug('fired event', { event, data, gaEvent })
}

const convertToGA = (data: any = {}) => {
  const values = Object.values(data)
  const eventValues = remove(values, x => typeof x === 'number')
  const eventStrings = remove(values, x => typeof x === 'string')
  const gaEvent = {
    eventValue: eventValues.shift(),
    eventLabel: eventStrings.shift() || eventValues.shift() || JSON.stringify(values.shift()),
  }
  return gaEvent
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
    const isRunningTests = env === 'test'
    const proxyToLogger = () => logError(...args)
    const { Unexpected, Network, Human } = ExceptionCategory
    const [logContext, logMessage, eMsg = '', errorObj, extra = {}] = args
    let { dialogShown, category = Unexpected, ...context } = extra
    let categoryToPassIntoLog = category
    let sessionUrlAtTime

    if (fullStoryState.ready && isFSEnabled) {
      sessionUrlAtTime = FS.getCurrentSessionURL(true)
    }

    if (isString(eMsg) && !isEmpty(eMsg)) {
      const lowerCased = toLower(eMsg)

      if (
        categoryToPassIntoLog === Unexpected &&
        ['connection', 'websocket', 'network'].some(str => lowerCased.includes(str))
      ) {
        categoryToPassIntoLog = Network
      }
    }

    if (isString(logMessage) && !logMessage.includes('axios')) {
      const logPayload = {
        unique: `${eMsg} ${logMessage} (${logContext.from})`,
        reason: logMessage,
        logContext,
        eMsg,
        dialogShown,
        category: categoryToPassIntoLog,
        context,
        sessionUrlAtTime,
      }

      debounceFireEvent(ERROR_LOG, logPayload)
    }

    if (!isRunningTests) {
      let errorToPassIntoLog = errorObj

      if (isError(errorObj)) {
        savedErrorMessages.set(errorObj, errorObj.message)
        errorToPassIntoLog.message = `${logMessage}: ${errorObj.message}`
      } else {
        errorToPassIntoLog = new Error(logMessage)
      }

      reportToSentry(
        errorToPassIntoLog,
        {
          logMessage,
          errorObj,
          logContext,
          eMsg,
          context,
          sessionUrlAtTime,
        },
        {
          dialogShown,
          category: categoryToPassIntoLog,
          level: categoryToPassIntoLog === Human ? 'info' : undefined,
        },
      )
    }

    if (isRunningTests || isMobileReactNative) {
      proxyToLogger()
      return
    }

    Sentry.flush().finally(() => {
      // if savedErrorMessage not empty that means errorObj
      // was an Error instrance and we mutated its message
      // so we have to restore it now
      if (savedErrorMessages.has(errorObj)) {
        errorObj.message = savedErrorMessages.get(errorObj)
      }

      proxyToLogger()
    })
  }
}
