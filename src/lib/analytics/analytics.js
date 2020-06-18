//@flow
import * as Sentry from '@sentry/browser'
import { debounce, forEach, get, invoke, isString } from 'lodash'
import API from '../../lib/API/api'
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

const FS = global.FS
const BugSnag = global.bugsnagClient
const Mautic = global.mt
const Rollbar = global.Rollbar
let Amplitude = invoke(global, 'amplitude.getInstance')

const log = logger.child({ from: 'analytics' })
const { sentryDSN, amplitudeKey, rollbarKey, version, env, network } = Config

const isSentryEnabled = !!sentryDSN
const isRollbarEnabled = !!(Rollbar && rollbarKey)
const isAmplitudeEnabled = !!(Amplitude && amplitudeKey)

/** @private */
const analyticsLoaded = async () => {
  const nextTick = window.requestIdleCallback || setTimeout

  const updatedInstance = invoke(global, 'amplitude.getInstance')

  log.info('test amplitude', {
    amplitude: global.amplitude,
    amplitudeInstance: global.amplitude.getInstance(),
    updatedInstance,
    isAmplitudeEnabled,
  })

  // we could add other conditions here
  if (!isAmplitudeEnabled || (updatedInstance && updatedInstance.Identify)) {
    Amplitude = updatedInstance
    return
  }

  await new Promise(resolve => nextTick(resolve))
  await analyticsLoaded()
}

export const initAnalytics = async () => {
  await analyticsLoaded()

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

/** @private */
const setUserEmail = email => {
  if (!email) {
    return
  }

  if (BugSnag) {
    const { user } = BugSnag

    BugSnag.user = {
      ...(user || {}),
      email,
    }
  }

  if (isRollbarEnabled) {
    Rollbar.configure({
      payload: {
        person: {
          email,
        },
      },
    })
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
  if (BugSnag) {
    BugSnag.user = {
      id: identifier,
    }
  }

  if (isRollbarEnabled) {
    Rollbar.configure({
      payload: {
        person: {
          id: identifier,
        },
      },
    })
  }

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
      FS: !!FS,
      Mautic: !!email,
      BugSnag: !!BugSnag,
      Sentry: isSentryEnabled,
      Rollbar: isRollbarEnabled,
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
      FS: !!FS,
      Mautic: !!email,
      BugSnag: !!BugSnag,
      Sentry: isSentryEnabled,
      Rollbar: isRollbarEnabled,
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

const patchLogger = () => {
  const logError = logger.error.bind(logger)

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
