// @flow
import * as SentryNative from '@sentry/react-native'
import amplitude from 'amplitude-js'
import analytics from '@react-native-firebase/analytics'
import { assign } from 'lodash'
import { convertToGoogleAnalytics } from './utils'

class GoogleWrapper {
  constructor(analytics) {
    assign(this, { analytics })
  }

  logEvent(event: string, data: any = {}) {
    const { analytics } = this
    const { eventName, eventData } = convertToGoogleAnalytics(event, data)

    analytics.logEvent(eventName, eventData)
  }
}

export default {
  sentry: SentryNative,
  amplitude: amplitude.getInstance(),
  googleAnalytics: new GoogleWrapper(analytics()),
}
