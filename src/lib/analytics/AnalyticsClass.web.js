import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'

class AnalyticsClass {
  Sentry = SentryWeb

  Amplitude = amplitude.getInstance()

  FS = {}

  GoogleAnalytics = {}
}

export default new AnalyticsClass()
