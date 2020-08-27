import * as SentryNative from '@sentry/react-native'
import amplitude from 'amplitude-js'

export default {
  sentry: SentryNative,
  amplitude: amplitude.getInstance(),
}

