// @flow
import * as sentry from '@sentry/react-native'
import { Amplitude, Identify } from '@amplitude/react-native'
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

export default () => {
  const amplitude = Amplitude.getInstance()
  const googleAnalytics = new GoogleWrapper(analytics())

  assign(amplitude, { Identify })
  return { sentry, amplitude, googleAnalytics }
}
