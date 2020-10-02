import Config from '../../config/config'

import API from '../../lib/API/api'
import logger from '../../lib/logger/pino-logger'
import apis from './apis'

import { AnalyticsClass } from './AnalyticsClass'

const analytics = new AnalyticsClass(apis, API, Config, logger)

// backward compatibility exports
export * from './constants'

export const {
  initAnalytics,
  identifyWith,
  identifyOnUserSignup,
  fireEvent,
  fireMauticEvent,
  fireEventFromNavigation,
  fireGoogleAnalyticsEvent,
} = analytics

export default analytics
