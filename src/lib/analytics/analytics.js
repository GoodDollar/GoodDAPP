import Config from '../../config/config'

import API from '../../lib/API'
import logger from '../../lib/logger/js-logger'
import apisFactory from './apis'

import { AnalyticsClass } from './AnalyticsClass'

const analytics = new AnalyticsClass(apisFactory, API, Config, logger)
const { emitter } = analytics

// backward compatibility exports
export * from './constants'
export const on = emitter.on.bind(emitter)

export const {
  initAnalytics,
  identifyWith,
  identifyOnUserSignup,
  fireEvent,
  fireEventFromNavigation,
  fireGoogleAnalyticsEvent,
  setUserProps,
  setUserPropsOnce,
  setChainId,
} = analytics

export default analytics
