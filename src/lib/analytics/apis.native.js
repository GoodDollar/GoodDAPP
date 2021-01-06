// @flow
import * as SentryNative from '@sentry/react-native'
import amplitude from 'amplitude-js'
import analytics from '@react-native-firebase/analytics'
import { assign } from 'lodash'

class GoogleWrapper {
  constructor(analytics) {
    assign(this, { analytics })
  }

  logEvent(event: string, data: any = {}) {
    const { analytics } = this

    analytics.logEvent(event, data)
  }
}

export default () => ({
  sentry: SentryNative,
  amplitude: amplitude.getInstance(),
  googleAnalytics: new GoogleWrapper(analytics()),
})
