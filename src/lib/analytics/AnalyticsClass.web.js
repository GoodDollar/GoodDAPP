import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'

export default new class {
  Amplitude = amplitude.getInstance()

  Mautic = global.mt

  FS = global.FS

  GoogleAnalytics = global.dataLayer

  Sentry = SentryWeb
}()
