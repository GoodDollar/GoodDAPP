import * as SentryNative from '@sentry/react-native'
import amplitude from 'amplitude-js'
import analytics from '@react-native-firebase/analytics'

const googleAnalyticsWrapper = {
  push: ({ event, ...data }) => {
    analytics().logEvent(event, data)
  },
}

export default {
  sentry: SentryNative,
  amplitude: amplitude.getInstance(),
  googleAnalytics: googleAnalyticsWrapper,
}
