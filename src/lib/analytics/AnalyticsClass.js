// @flow
import {
  assign,
  debounce,
  forIn,
  forOwn,
  get,
  isEmpty,
  isError,
  isString,
  mapKeys,
  memoize,
  pick,
  pickBy,
  toLower,
} from 'lodash'
import EventEmitter from 'eventemitter3'
import { cloneErrorObject, ExceptionCategory } from '../exceptions/utils'
import { isWeb, osVersion } from '../utils/platform'
import DeepLinking from '../utils/deepLinking'
import isWebApp from '../utils/isWebApp'
import { createUrlObject } from '../utils/uri'
import { ERROR_LOG } from './constants'

export class AnalyticsClass {
  apis = {}

  apisFactory = null

  emitter = new EventEmitter()

  posthog = null

  constructor(apisFactory, rootApi, Config, loggerApi) {
    const logger = loggerApi.get('analytics')
    const options = pick(
      Config,
      'sentryDSN',
      'sentryReplaySampleRate',
      'amplitudeKey',
      'version',
      'env',
      'sentryReplayEnabled',
    )

    assign(this, options, { logger, apisFactory, rootApi, loggerApi })
  }

  initAnalytics = async (tags = {}) => {
    const {
      apis,
      apisFactory,
      sentryDSN,
      sentryReplaySampleRate,
      sentryReplayEnabled,
      amplitudeKey,
      version,
      network,
      logger,
      env,
      loggerApi,
    } = this

    const apisDetected = apisFactory()
    let { amplitude, sentry, googleAnalytics } = apisDetected

    const isSentryEnabled = !!(sentry && sentryDSN)
    const isAmplitudeEnabled = !!(amplitude && amplitudeKey)
    const isGoogleEnabled = !!googleAnalytics

    assign(apis, apisDetected)
    assign(this, { isSentryEnabled, isAmplitudeEnabled, isGoogleEnabled })

    const params = DeepLinking.params

    let source = isWeb
      ? document.referrer.match(/^https:\/\/(www\.)?gooddollar\.org/) == null
        ? document.referrer
        : 'web3'
      : undefined
    source = Object.keys(pick(params, ['inviteCode', 'paymentCode', 'code'])).pop() || source
    const platform = isWeb ? (isWebApp ? 'webapp' : 'web') : 'native'

    // invites backward compatability for campaign
    const utmTags = pickBy(params, (value, key) => key.startsWith('utm_') || key === 'campaign')
    if (utmTags.campaign) {
      utmTags.utm_campaign = utmTags.campaign
      delete utmTags.campaign
    }

    const allTags = { ...(tags || {}), os_version: osVersion, platform, version, ...utmTags }

    const onceTags = { first_open_date: new Date().toString(), source, ...mapKeys(utmTags, (v, k) => `initial_${k}`) }

    logger.debug('init analytics tags:', { allTags, onceTags })

    // make sure all users will have the new signedup prop
    if (tags?.isLoggedIn) {
      onceTags.signedup = true
    }

    if (isAmplitudeEnabled) {
      logger.info('preinitializing Amplitude with license key')

      const success = await this.initAmplitude(amplitudeKey)

      this.isAmplitudeEnabled = success
      logger.info('License sent to Amplitude', { success })

      const identity = new amplitude.Identify()
      forOwn(onceTags, (value, key) => identity.setOnce(key, value))
      forOwn(allTags, (value, key) => identity.set(key, value))

      amplitude.setVersionName(version)
      amplitude.identify(identity)
    }

    if (isSentryEnabled) {
      const sentryOptions = {
        dsn: sentryDSN,
        environment: env,
        release: `${version}+${env}`,
      }

      const sentryScope = {
        appVersion: version,
        networkUsed: network,
        ...(tags || {}),
      }

      if (isWeb && sentryReplayEnabled) {
        assign(sentryOptions, {
          replaysSessionSampleRate: sentryReplaySampleRate,
          replaysOnErrorSampleRate: 1.0,
          integrations: [new sentry.Replay()],
        })
      }

      logger.info('initializing Sentry:', { sentryOptions, sentryScope })

      sentry.init(sentryOptions)
      sentry.configureScope(scope => forIn(sentryScope, (value, property) => scope.setTag(property, value)))
    }

    if (isGoogleEnabled && !isEmpty(allTags)) {
      await googleAnalytics.setUserProperties(allTags)
    }

    logger.debug('available analytics:', {
      Sentry: isSentryEnabled,
      Amplitude: isAmplitudeEnabled,
      Google: isGoogleEnabled,
    })

    const errorLevel = loggerApi.ERROR.name

    loggerApi.on(errorLevel, (...args) => this.onErrorLogged(args))
    logger.debug('listening for error logs', { errorLevel, logger, loggerApi })
  }

  setPostHog = posthog => {
    this.posthog = posthog
  }

  identifyWith = (identifier, email = null) => {
    const { apis, logger, isAmplitudeEnabled, isSentryEnabled, isGoogleEnabled } = this
    const { amplitude, sentry, googleAnalytics } = apis

    if (isAmplitudeEnabled && identifier) {
      amplitude.setUserId(identifier)
    }

    if (isSentryEnabled && identifier) {
      sentry.configureScope(scope =>
        scope.setUser({
          id: identifier,
        }),
      )
    }

    if (isGoogleEnabled && identifier) {
      googleAnalytics.identify(identifier)
    }

    if (email) {
      this.setUserEmail(email)
    }

    logger.debug(
      'Analytics services identified with:',
      { email, identifier },
      {
        isSentryEnabled,
        isAmplitudeEnabled,
      },
    )

    this.emit('identify', { email, identifier, signup: false })
  }

  // eslint-disable-next-line require-await
  identifyOnUserSignup = async email => {
    const { logger } = this
    const { isSentryEnabled, isAmplitudeEnabled } = this

    this.setUserEmail(email)

    logger.debug(
      'Analytics services identified during new user signup:',
      { email },
      {
        isSentryEnabled,
        isAmplitudeEnabled,
      },
    )

    this.emit('identify', { email, signup: true })
  }

  fireEvent = (event: string, eventData: any = {}) => {
    const { isAmplitudeEnabled, apis, logger, chainId, posthog } = this
    const { amplitude, googleAnalytics } = apis
    const data = { chainId, ...eventData }
    const disabledEvents = posthog ? posthog.getFeatureFlagPayload('disabled-events') || [] : []

    if (isAmplitudeEnabled && !disabledEvents.find(ev => event.search('^' + ev + '$') === 0)) {
      if (!amplitude.logEvent(event, data)) {
        logger.warn('Amplitude event not sent', { event, data })
      }
    } else {
      logger.debug('skipping disabled event', event)
    }

    // fire all events on  GA also
    if (googleAnalytics) {
      this.fireGoogleAnalyticsEvent(event, data)
    }

    logger.debug('fired event', { event, data })
    this.emit('fireEvent', { event, data })
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

  captureUtmTags = (url: string) => {
    try {
      const { params } = createUrlObject(url)
      const utmTags = pickBy(params, (value, key) => key.startsWith('utm_') || key === 'campaign')
      if (utmTags.campaign) {
        utmTags.utm_campaign = utmTags.campaign
        delete utmTags.campaign
      }
      const onceTags = mapKeys(utmTags, (v, k) => `initial_${k}`)
      this.setUserProps(utmTags)
      this.setUserProps(onceTags, true)
      this.logger.debug('captureUtmTags', { url, utmTags, onceTags, params })
    } catch (e) {
      this.logger.error('captureUtmTags failed:', e.message, e, { url })
    }
  }

  setUserPropsOnce = props => {
    this.setUserProps(props, true)
  }

  setUserProps = (props, once = false) => {
    const { isAmplitudeEnabled, isSentryEnabled, apis } = this
    const { amplitude, sentry } = apis

    if (isAmplitudeEnabled) {
      if (once) {
        const identity = new amplitude.Identify()
        forOwn(props, (value, key) => identity.append(key, value))
        amplitude.identify(identity)
      } else {
        amplitude.setUserProperties(props)
      }
    }

    if (isSentryEnabled) {
      sentry.configureScope(scope => {
        const { _user } = scope

        scope.setUser({ ...(_user || {}), ...props })
      })
    }
  }

  setChainId = chainId => {
    this.chainId = chainId
  }

  /** @private */
  setUserEmail(email) {
    if (!email) {
      return
    }

    this.setUserProps({ email })
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
  getDebouncedFireEvent = memoize(uniqueId => debounce(this.fireEvent, 500, { leading: true }))

  filteredNetworkErrors = /failed to fetch|network request failed|network error/i

  // @private
  onErrorLogged(args) {
    const { Unexpected, Network, Human } = ExceptionCategory
    const { isSentryEnabled, env, logger, filteredNetworkErrors } = this
    const isRunningTests = env === 'test'

    try {
      const [logContext, logMessage, eMsg = '', errorObj, extra = {}] = args
      let { dialogShown, category = Unexpected, ...context } = extra

      let categoryToPassIntoLog = category
      let errorToPassIntoLog

      logger.debug('processing error log:', args)

      if (isString(eMsg) && !isEmpty(eMsg)) {
        const lowerCased = toLower(eMsg)

        if (
          categoryToPassIntoLog === Unexpected &&
          ['connection', 'websocket', 'network'].some(str => lowerCased.includes(str))
        ) {
          categoryToPassIntoLog = Network
        }
      }

      if (isString(logMessage) && !logMessage.includes('axios') && !filteredNetworkErrors.test(eMsg)) {
        const unique = `${eMsg} ${logMessage} (${logContext.from})`
        const debouncedFireEvent = this.getDebouncedFireEvent(unique)

        const eventPayload = {
          eMsg,
          unique,
          context,
          logContext,
          dialogShown,
          reason: logMessage,
          category: categoryToPassIntoLog,
        }

        logger.debug('sending ERROR_LOG to Amplitude', eventPayload)
        debouncedFireEvent(ERROR_LOG, eventPayload)
      }

      if (!isSentryEnabled || isRunningTests) {
        return
      }

      if (isError(errorObj)) {
        errorToPassIntoLog = cloneErrorObject(errorObj)
        errorToPassIntoLog.message = `${logMessage}: ${errorObj.message}`
      } else {
        errorToPassIntoLog = new Error(`${logMessage}: ${eMsg}`)
      }

      const sentryPayload = {
        logMessage,
        errorObj,
        logContext,
        eMsg,
        context,
      }

      const sentryTags = {
        dialogShown,
        category: categoryToPassIntoLog,
        level: categoryToPassIntoLog === Human ? 'info' : undefined,
      }

      logger.debug('sending error to Sentry', { sentryPayload, sentryTags })
      this.reportToSentry(errorToPassIntoLog, sentryPayload, sentryTags)
    } catch (e) {
      logger.warn('logging error failed', e.message, e, { args })
      this.fireEvent('ERROR_LOG_FAILED', { eMsg: e.message })
    }
  }

  /**
   * @private
   */
  emit(event, data) {
    const { emitter } = this

    emitter.emit(event, data)
    emitter.emit('*', event, data)
  }
}
