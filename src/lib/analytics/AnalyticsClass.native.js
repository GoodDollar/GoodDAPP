import * as SentryNative from '@sentry/react-native'
import amplitude from 'amplitude-js'

export default new class {
  Sentry = SentryNative

  Amplitude = amplitude.getInstance()

  FS = undefined

  GoogleAnalytics = undefined

  fullStoryReady = () => {
    return false
  }
}()
