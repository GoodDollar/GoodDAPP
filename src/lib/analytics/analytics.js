//@flow
import { debounce, forEach, get, isFunction, isString } from 'lodash'
import { isMobileReactNative } from '../utils/platform'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import { ExceptionCategory } from '../logger/exceptions'
import { ERROR_LOG } from '../constants/analytics'
import AnalyticsClass from './AnalyticsClass'

const { Amplitude, Mautic, FS, GoogleAnalytics, Sentry, fullStoryReady, mauticReady } = AnalyticsClass
const { sentryDSN, amplitudeKey, version, env, network, phase } = Config
const log = logger.child({ from: 'analytics' })

export default new class {
  isFSAvailable = !!FS

  isFSEnabled = this.isFSAvailable && Config.env === 'production'

  isSentryEnabled = !!sentryDSN

  isAmplitudeEnabled = !!amplitudeKey

  isGoogleAnalyticsEnabled = !!GoogleAnalytics

  isMauticEnabled = !!Mautic

  // eslint-disable-next-line require-await
  initAmplitude = async key => {
    if (!this.isAmplitudeEnabled) {
      return
    }
    return new Promise(resolve => {
      const onError = () => resolve(false)
      const onSuccess = () => resolve(true)

      Amplitude.init(key, null, { onError }, onSuccess)
    })
  }

  initAnalytics = async () => {
    const {
      isFSAvailable,
      isFSEnabled,
      isAmplitudeEnabled,
      initAmplitude,
      isSentryEnabled,
      isMauticEnabled,
      isGoogleAnalyticsEnabled,
      patchLogger,
    } = this

    log.info('pre-initializing & preloading FS, Mautic & Amplitude')

    await Promise.all([
      isFSEnabled && fullStoryReady.then(ready => (this.isFSEnabled = ready)),
      isMauticEnabled && !isMobileReactNative && mauticReady.then(ready => (this.isMauticEnabled = ready)),
      isAmplitudeEnabled && initAmplitude(amplitudeKey).then(ready => (this.isAmplitudeEnabled = ready)),
    ])

    log.info('preloaded FS, Mautic & Amplitude')

    if (isFSAvailable && !isFSEnabled && isFunction(FS.shutdown)) {
      FS.shutdown()
    }

    if (isAmplitudeEnabled) {
      const identity = new Amplitude.Identify().setOnce('first_open_date', new Date().toString())

      identity.append('phase', String(phase))
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
  setUserEmail = email => {
    const { isAmplitudeEnabled, isSentryEnabled } = this
    if (!email) {
      return
    }

    if (isAmplitudeEnabled) {
      Amplitude.setUserProperties({ email })
    }

    if (this.isFSEnabled) {
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

  identifyWith = (email, identifier = null) => {
    const { isAmplitudeEnabled, isSentryEnabled, setUserEmail, isFSEnabled } = this
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

  // eslint-disable-next-line require-await
  identifyOnUserSignup = async email => {
    const { setUserEmail, isFSEnabled, isMauticEnabled, isSentryEnabled, isAmplitudeEnabled } = this
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

  fireEvent = (event: string, data: any = {}) => {
    if (!this.isAmplitudeEnabled) {
      return
    }

    if (!Amplitude.logEvent(event, data)) {
      log.warn('Amplitude event not sent', { event, data })
      return
    }

    log.debug('fired event', { event, data })
  }

  fireMauticEvent = (data: any = {}) => {
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

  reportToSentry = (error, extra = {}, tags = {}) => {
    if (!this.isSentryEnabled) {
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
    if (!this.isGoogleAnalyticsEnabled) {
      return
    }

    GoogleAnalytics.push({ event, ...data })
  }

  patchLogger = () => {
    const logError = logger.error.bind(logger)

    // for error logs if they happen frequently only log one
    const debounceFireEvent = debounce(this.fireEvent, 500, { leading: true })

    logger.error = (...args) => {
      const isRunningTests = env === 'test'
      const proxyToLogger = () => logError(...args)
      const { Unexpected, Network, Human } = ExceptionCategory
      const [logContext, logMessage, eMsg = '', errorObj, extra = {}] = args
      let { dialogShown, category = Unexpected, ...context } = extra
      let categoryToPassIntoLog = category

      if (
        categoryToPassIntoLog === Unexpected &&
        ['connection', 'websocket', 'network'].some(str => eMsg.toLowerCase().includes(str))
      ) {
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
          context,
        }

        if (this.isFSEnabled) {
          const sessionUrlAtTime = FS.getCurrentSessionURL(true)

          Object.assign(logPayload, { sessionUrlAtTime })
        }

        debounceFireEvent(ERROR_LOG, logPayload)
      }

      let savedErrorMessage

      if (!isRunningTests) {
        let errorToPassIntoLog = errorObj

        if (errorObj instanceof Error) {
          savedErrorMessage = errorObj.message
          errorToPassIntoLog.message = `${logMessage}: ${errorObj.message}`
        } else {
          errorToPassIntoLog = new Error(logMessage)
        }

        this.reportToSentry(
          errorToPassIntoLog,
          {
            logMessage,
            errorObj,
            logContext,
            eMsg,
            context,
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
        if (savedErrorMessage) {
          errorObj.message = savedErrorMessage
        }

        proxyToLogger()
      })
    }
  }
}()
