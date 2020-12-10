// @flow
import * as SentryNative from '@sentry/react-native'
import amplitude from 'amplitude-js'
import analytics from '@react-native-firebase/analytics'
import { convertToGoogleAnalytics } from './utils'

const googleWrapper = {
  logEvent: (event, data: any = {}) => {
    const eventData = convertToGoogleAnalytics(data)

    analytics().logEvent(event, eventData)
  },
}

export default {
  sentry: SentryNative,
  amplitude: amplitude.getInstance(),
  googleAnalytics: googleWrapper,
}
