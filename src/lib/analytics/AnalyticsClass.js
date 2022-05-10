// @flow
import {
  assign,
  debounce,
  forIn,
  get,
  isEmpty,
  isError,
  isNumber,
  isString,
  isUndefined,
  negate,
  pick,
  pickBy,
  remove,
  toLower,
  values,
} from 'lodash'

import { cloneErrorObject, ExceptionCategory } from '../exceptions/utils'
import { isWeb, osVersion } from '../utils/platform'
import { ANALYTICS_EVENT, ERROR_LOG } from './constants'

export class AnalyticsClass {
  apis = {}

  apisFactory = null

  constructor(apisFactory, rootApi, Config, loggerApi) {
    const logger = loggerApi.get('analytics')
    const options = pick(Config, 'sentryDSN', 'amplitudeKey', 'version', 'env', 'phase')

    assign(this, options, { logger, apisFactory, rootApi, loggerApi })
  }

  initAnalytics = async () => {
    const { apis, apisFactory, sentryDSN, amplitudeKey, version, network, logger, env, phase } = this

    const apisDetected = apisFactory()
    const { fullStory, amplitude, sentry, googleAnalytics } = apisDetected

    const isSentryEnabled = !!(sentry && sentryDSN)
    const isAmplitudeEnabled = !!(amplitude && amplitudeKey)
    const isFullStoryEnabled = !!(fullStory && env === 'production')

    assign(apis, apisDetected)
    assign(this, { isSentryEnabled, isAmplitudeEnabled, isFullStoryEnabled })

    if (fullStory && !isFullStoryEnabled) {
      fullStory.onReady(() => fullStory.shutdown())
    }

    if (isAmplitudeEnabled) {
      logger.info('preinitializing Amplitude with license key')

      const success = await this.initAmplitude(amplitudeKey)

      this.isAmplitudeEnabled = success
      logger.info('License sent to Amplitude', { success })

      const identity = new amplitude.Identify()

      identity.setOnce('first_open_date', new Date().toString())
      identity.append('phase', String(phase))

      amplitude.setVersionName(version)
      amplitude.identify(identity)
      amplitude.setUserProperties({ os_version: osVersion })
    }

    if (isSentryEnabled) {
      const sentryOptions = {
        dsn: sentryDSN,
        environment: env,
      }

      const sentryScope = {
        appVersion: version,
        networkUsed: network,
        phase,
      }

      if (isWeb) {
        sentryOptions.release = `${version}+${env}`
      }

      logger.info('initializing Sentry:', { sentryOptions, sentryScope })

      sentry.init(sentryOptions)
      sentry.configureScope(scope => forIn(sentryScope, (value, property) => scope.setTag(property, value)))
    }

    logger.debug('available analytics:', {
      FS: isFullStoryEnabled,
      Sentry: isSentryEnabled,
      Amplitude: isAmplitudeEnabled,
      Google: !!googleAnalytics,
    })

    const { fireEvent, loggerApi } = this
    const debouncedFireEvent = debounce(fireEvent, 500, { leading: true })

    loggerApi.on(loggerApi.ERROR.name, (...args) => this.onErrorLogged(debouncedFireEvent, args))
  }

  identifyWith = (email, identifier = null) => {
    const { apis, version, phase, logger } = this
    const { amplitude, sentry, fullStory } = apis
    const { isAmplitudeEnabled, isSentryEnabled, isFullStoryEnabled } = this

    if (isAmplitudeEnabled && identifier) {
      amplitude.setUserId(identifier)
    }

    if (isFullStoryEnabled) {
      fullStory.identify(identifier, {
        appVersion: version,
        phase,
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
        FS: isFullStoryEnabled,
        Sentry: isSentryEnabled,
        Amplitude: isAmplitudeEnabled,
      },
    )
  }

  // eslint-disable-next-line require-await
  identifyOnUserSignup = async email => {
    const { logger } = this
    const { isSentryEnabled, isAmplitudeEnabled, isFullStoryEnabled } = this

    this.setUserEmail(email)

    logger.debug(
      'Analytics services identified during new user signup:',
      { email },
      {
        FS: isFullStoryEnabled,
        Sentry: isSentryEnabled,
        Amplitude: isAmplitudeEnabled,
      },
    )
  }

  fireEvent = (event: string, data: any = {}) => {
    const { isAmplitudeEnabled, apis, logger } = this
    const { amplitude, googleAnalytics } = apis

    if (isAmplitudeEnabled) {
      if (!amplitude.logEvent(event, data)) {
        logger.warn('Amplitude event not sent', { event, data })
      }
    }

    //fire all events on  GA also
    if (googleAnalytics) {
      const _values = values(data)

      // remove returns the removed items, so eventValues will be numbers
      const eventValues = remove(_values, isNumber)
      const eventStrings = remove(_values, isString)
      const eventData = {
        eventAction: event,
        eventValue: eventValues.shift(),
        eventLabel: eventStrings.shift() || eventValues.shift() || JSON.stringify(_values.shift()),
      }

      this.fireGoogleAnalyticsEvent(ANALYTICS_EVENT, pickBy(eventData, negate(isUndefined)))
    }

    logger.debug('fired event', { event, data })
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
    const { apis, logger } = this
    const { googleAnalytics } = apis

    if (!googleAnalytics) {
      logger.warn('GoogleAnalytics event was not sent', { event, data })
      return
    }

    googleAnalytics.logEvent(event, data)
    logger.debug('Fired GoogleAnalytics event', { event, data })
  }

  // @private
  // eslint-disable-next-line require-await
  async initAmplitude(key) {
    const { apis, isAmplitudeEnabled } = this
    const { amplitude } = apis

    if (!isAmplitudeEnabled) {
      return
    }

    return new Promise(resolve => {
      const onError = err => {
        this.logger.warn('Amplitude init error', err)
        resolve(false)
      }
      const onSuccess = () => {
        this.logger.debug('Amplitude init success')
        resolve(true)
      }

      amplitude.init(key, null, { includeUtm: true, onError }, onSuccess)
    })
  }

  /** @private */
  setUserEmail(email) {
    const { isAmplitudeEnabled, isSentryEnabled, isFullStoryEnabled, apis } = this
    const { amplitude, sentry, fullStory } = apis

    if (!email) {
      return
    }

    if (isAmplitudeEnabled) {
      amplitude.setUserProperties({ email })
    }

    if (isFullStoryEnabled) {
      fullStory.setUserVars({ email })
    }

    if (isSentryEnabled) {
      sentry.configureScope(scope => {
        const { _user } = scope

        scope.setUser({ ...(_user || {}), email })
      })
    }
  }

  // @private
  reportToSentry(error, extra = {}, tags = {}) {
    const { apis, isSentryEnabled, logger } = this
    const { sentry } = apis

    if (!isSentryEnabled) {
      return
    }

    const { logContext, eMsg } = extra
    const fingerprint = [get(logContext, 'from', '{{ default }}'), eMsg]

    sentry.configureScope(scope => {
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
      sentry.captureException(error)

      logger.debug('Captured Sentry exception', { fingerprint, tags: tagsSet, extraTags })
    })
  }

  // @private
  onErrorLogged(debouncedFireEvent, args) {
    const { apis, isSentryEnabled, isFullStoryEnabled, env } = this
    const isRunningTests = env === 'test'
    const { Unexpected, Network, Human } = ExceptionCategory
    const [logContext, logMessage, eMsg = '', errorObj, extra = {}] = args

    let { dialogShown, category = Unexpected, ...context } = extra
    let categoryToPassIntoLog = category
    let errorToPassIntoLog
    let sessionUrlAtTime

    logger.debug('processing error log:', args)

    if (isFullStoryEnabled && apis.fullStory.ready) {
      sessionUrlAtTime = apis.fullStory.getCurrentSessionURL(true)
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
      debouncedFireEvent(ERROR_LOG, {
        unique: `${eMsg} ${logMessage} (${logContext.from})`,
        reason: logMessage,
        logContext,
        eMsg,
        dialogShown,
        category: categoryToPassIntoLog,
        context,
        sessionUrlAtTime,
      })
    }

    if (!isSentryEnabled || isRunningTests) {
      return
    }

    if (isError(errorObj)) {
      errorToPassIntoLog = cloneErrorObject(errorObj)
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
        sessionUrlAtTime,
      },
      {
        dialogShown,
        category: categoryToPassIntoLog,
        level: categoryToPassIntoLog === Human ? 'info' : undefined,
      },
    )
  }
}
