import Config from '../../config/config'

import API from '../../lib/API/api'
import logger from '../../lib/logger/js-logger'
import apisFactory from './apis'

import { AnalyticsClass } from './AnalyticsClass'

const analytics = new AnalyticsClass(apisFactory, API, Config, logger)

// backward compatibility exports
export * from './constants'

export const {
  initAnalytics,
  identifyWith,
  identifyOnUserSignup,
  fireEvent,
  fireEventFromNavigation,
  fireGoogleAnalyticsEvent,
} = analytics

export default analytics
