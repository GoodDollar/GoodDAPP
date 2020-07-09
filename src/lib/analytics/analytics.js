//@flow

// libraries
import * as Sentry from '@sentry/browser'

import { assign, debounce, forEach, get, isError, isFunction, isString, pick, pickBy, values } from 'lodash'

// utils
import API from '../../lib/API/api'
import Config from '../../config/config'
import logger, { addLoggingListener, ExceptionCategory, LogEvent } from '../../lib/logger/pino-logger'
import Redact from '../utils/redact'

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

const detectAPIs = () => {
  const { mt, FS, dataLayer, amplitude } = global
  const amplitudeFactory = amplitude ? () => amplitude.getInstance() : null

  return pickBy({
    mautic: mt,
    fullStory: FS,
    sentry: Sentry,
    googleAnalytics: dataLayer,
    amplitudeFactory,
  })
}

const loggingAPI = {
  addLoggingListener,
  child: logContext => logger.child(logContext),
}

const analytics = new class {
  apis = {}

  rootApi = null

  loggerApi = null

  secureTransmit = false

  isSentryEnabled = false

  isAmplitudeEnabled = false

  amplitudeKey = null

  sentryDSN = null

  version = null

  network = null

  env = null

  redact = null

  logger = null

  constructor(apis, rootApi, Config, loggerApi) {
    const { sentryDSN, amplitudeKey, secureTransmit, transmitSecureKeys, transmitCensor } = Config
    const { amplitudeFactory, sentry } = apis

    assign(this.apis, apis)
    assign(this, pick(Config, 'sentryDSN', 'amplitudeKey', 'version', 'env'))

    this.rootApi = rootApi
    this.loggerApi = loggerApi
    this.secureTransmit = secureTransmit

    if (secureTransmit) {
      this.redact = new Redact(transmitSecureKeys, transmitCensor)
    }

    this.isSentryEnabled = !(!sentry || !sentryDSN)
    this.isAmplitudeEnabled = !(!amplitudeFactory || !amplitudeKey)

    this.logger = loggerApi.child({ from: 'analytics' })
  }

  // definine public methods as arrows to keep this and simplify compatibility exports
  initAnalytics = async () => {
    const { isSentryEnabled, isAmplitudeEnabled, apis, version, network } = this
    const { fullStory } = apis

    // pre-initializing & preloading FS & Amplitude
    // eslint-disable-next-line
    await Promise.all([
      fullStory && this.initFullStory(),
      isAmplitudeEnabled && this.initAmplitude(amplitudeKey)
    ])

    const { amplitudeKey, sentryDSN, env, logger } = this
    const { amplitude, sentry } = apis

    if (isAmplitudeEnabled) {
      const identity = new amplitude.Identify().setOnce('first_open_date', new Date().toString())

      amplitude.setVersionName(version)
      amplitude.identify(identity)

      if (fullStory) {
        const sessionUrl = fullStory.getCurrentSessionURL()

        // set session URL to user props once FS & Amplitude both initialized
        amplitude.setUserProperties({ sessionUrl })
      }
    }

    if (isSentryEnabled) {
      sentry.init({
        dsn: sentryDSN,
        environment: env,
      })

      sentry.configureScope(scope => {
        scope.setTag('appVersion', version)
        scope.setTag('networkUsed', network)
      })
    }

    logger.debug('Initialized analytics:', {
      FS: !!fullStory,
      Sentry: isSentryEnabled,
      Amplitude: isAmplitudeEnabled,
    })

    this.listenLogger()
  }

  identifyOnUserSignup = async email => {
    const { env, logger, apis, rootApi, isSentryEnabled, isAmplitudeEnabled } = this
    const { mautic, fullStory } = apis

    this.setUserEmail(email)

    if (mautic && email && 'production' === env) {
      await rootApi.addMauticContact({ email })
    }

    logger.debug(
      'Analytics services identified during new user signup:',
      { email },
      {
        FS: !!fullStory,
        Sentry: isSentryEnabled,
        Amplitude: isAmplitudeEnabled,
        Mautic: !(!mautic || !email),
      },
    )
  }

  identifyWithSignedInUser = async (goodWallet: GoodWallet, userStorage: UserStorage) => {
    const { logger } = this
    const identifier = goodWallet.getAccountForType('login')
    const email = await userStorage.getProfileFieldValue('email')

    logger.debug('got identifiers', { identifier, email })

    this.identifyWith(email, identifier)
  }

  reportToSentry = (error, extra = {}, tags = {}) => {
    const { isSentryEnabled, apis } = this
    const { sentry } = apis

    if (!isSentryEnabled) {
      return
    }

    sentry.configureScope(scope => {
      // set extra
      forEach(extra, (value, key) => {
        scope.setExtra(key, value)
      })

      // set tags
      forEach(tags, (value, key) => {
        scope.setTag(key, value)
      })

      sentry.captureException(error)
    })
  }

  fireEvent = (event: string, data: any = {}) => {
    const { isAmplitudeEnabled, apis, logger } = this
    const { amplitude } = apis

    if (!isAmplitudeEnabled) {
      return
    }

    if (!amplitude.logEvent(event, data)) {
      logger.warn('Amplitude event not sent', { event, data })
      return
    }

    logger.debug('fired event', { event, data })
  }

  fireMauticEvent = (data: any = {}) => {
    const { mautic } = this.apis

    if (!mautic) {
      return
    }

    const { userId } = mautic
    let eventData = data

    if (userId) {
      // do not mutate source params
      eventData = { ...data, email: userId }
    }

    mautic('send', 'pageview', eventData)
  }

  /**
   * Create code from navigation active route and call `fireEvent`
   * @param {object} route
   */
  fireEventFromNavigation = route => {
    const { routeName: key, params } = route
    const action = get(params, 'action', 'GOTO')
    const code = `${action}_${key}`.toUpperCase()

    this.fireEvent(code)
  }

  /**
   * fire event to google analytics
   *
   * @param {string} event Event name
   * @param {object} data Event properties (optional)
   * @return {void}
   */
  fireGoogleAnalyticsEvent = (event, data = {}) => {
    const { googleAnalytics } = this.apis

    if (!googleAnalytics) {
      return
    }

    googleAnalytics.push({ event, ...data })
  }

  /** @private */
  // eslint-disable-next-line require-await
  async initAmplitude() {
    const { apis, isAmplitudeEnabled, amplitudeKey } = this
    const { amplitudeFactory } = apis

    if (!isAmplitudeEnabled) {
      return
    }

    return new Promise(resolve =>
      amplitudeFactory().init(amplitudeKey, null, null, () => {
        apis.amplitude = amplitudeFactory()
        resolve()
      }),
    )
  }

  /** @private */
  // eslint-disable-next-line require-await
  async initFullStory() {
    return new Promise(resolve => {
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
  }

  /** @private */
  setUserEmail(email) {
    const { isAmplitudeEnabled, isSentryEnabled, apis } = this
    const { amplitude, sentry, fullStory, mautic } = apis

    if (!email) {
      return
    }

    if (isAmplitudeEnabled) {
      amplitude.setUserProperties({ email })
    }

    if (fullStory) {
      fullStory.setUserVars({
        email,
      })
    }

    if (isSentryEnabled) {
      sentry.configureScope(scope => {
        const { _user } = scope

        scope.setUser({
          ...(_user || {}),
          email,
        })
      })
    }

    if (mautic) {
      mautic.userId = email
    }
  }

  /** @private */
  identifyWith(email, identifier = null) {
    const { isAmplitudeEnabled, isSentryEnabled, apis, version, logger } = this
    const { amplitude, sentry, fullStory, mautic } = apis

    if (isAmplitudeEnabled && identifier) {
      amplitude.setUserId(identifier)
    }

    if (fullStory) {
      fullStory.identify(identifier, {
        appVersion: version,
      })
    }

    if (isSentryEnabled) {
      sentry.configureScope(scope =>
        scope.setUser({
          id: identifier,
        }),
      )
    }

    this.setUserEmail(email)

    logger.debug(
      'Analytics services identified with:',
      { email, identifier },
      {
        FS: !!fullStory,
        Mautic: !(!mautic || !email),
        Sentry: isSentryEnabled,
        Amplitude: isAmplitudeEnabled,
      },
    )
  }

  /** @private */
  listenLogger() {
    const { fireEvent, apis, isSentryEnabled, secureTransmit, loggerApi, redact, env } = this
    const { sentry, fullStory } = apis

    // for error logs if they happen frequently only log one
    const debounceFireEvent = debounce(fireEvent, 500, { leading: true })
    const networkReasonRegex = /(connection|websocket|network)/i

    const createError = (msg, type, stack) => {
      const error = new Error(msg)
      const stackDescriptor = Object.getOwnPropertyDescriptor('stack')

      error.name = type
      Object.defineProperty(error, 'stack', { ...stackDescriptor, value: stack })

      return error
    }

    loggerApi.addLoggingListener(LogEvent.Error, async ({ bindings, messages }) => {
      const { Unexpected, Network, Human } = ExceptionCategory

      const [logContext = {}] = bindings
      const [logMessage, eMsg = '', error, extra = {}] = messages
      let errorObj = error

      if (isString(error)) {
        errorObj = new Error(error)
      } else if (!isError(error)) {
        const { msg, type, trace } = error

        errorObj = createError(msg, type, trace)
      }

      let { dialogShown, category = Unexpected } = extra
      let categoryToPassIntoLog = category

      if (categoryToPassIntoLog === Unexpected && networkReasonRegex.test(eMsg)) {
        categoryToPassIntoLog = Network
      }

      if (isString(logMessage) && !logMessage.includes('axios')) {
        const logPayload = {
          unique: `${eMsg} ${logMessage} (${logContext.from})`,
          reason: logMessage,
          logContext,
          eMsg,
          dialogShown,
          category: categoryToPassIntoLog,
          errorObj,
        }

        if (fullStory) {
          const sessionUrlAtTime = fullStory.getCurrentSessionURL(true)

          assign(logPayload, { sessionUrlAtTime })
        }

        debounceFireEvent(ERROR_LOG, logPayload)
      }

      if (!isSentryEnabled || env === 'test') {
        return
      }

      const { name, message, stack } = errorObj
      const errorToPassIntoLog = createError(`${logMessage}: ${message}`, name, stack)

      const sentryPayload = {
        logMessage,
        errorObj,
        logContext,
        eMsg,
        extra,
      }

      const secureObjects = [errorToPassIntoLog, ...values(sentryPayload)]

      if (secureTransmit) {
        secureObjects.forEach(object => redact.censor(object))
      }

      this.reportToSentry(errorToPassIntoLog, sentryPayload, {
        dialogShown,
        category: categoryToPassIntoLog,
        level: categoryToPassIntoLog === Human ? 'info' : undefined,
      })

      if (secureTransmit) {
        try {
          await sentry.flush()
        } finally {
          secureObjects.forEach(object => redact.restore(object))
        }
      }
    })
  }
}(detectAPIs(), API, Config, loggingAPI)

// backward compatibility exports
export const {
  initAnalytics,
  identifyOnUserSignup,
  identifyWithSignedInUser,
  reportToSentry,
  fireEvent,
  fireMauticEvent,
  fireEventFromNavigation,
  fireGoogleAnalyticsEvent,
} = analytics

export default analytics
