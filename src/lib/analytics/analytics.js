import apis from './apis'
import Config from '../../config/config'

import API from '../../lib/API/api'
import logger from '../../lib/logger/pino-logger'

import { AnalyticsClass } from './AnalyticsClass'

const analytics = new AnalyticsClass(apis, API, Config, logger)

// backward compatibility exports
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
