import * as SentryNative from '@sentry/react-native'
import amplitude from 'amplitude-js'

class AnalyticsClass {
  Sentry = SentryNative

  Amplitude = amplitude.getInstance()

  FS = {}

  GoogleAnalytics = {}
}

export default new AnalyticsClass()
