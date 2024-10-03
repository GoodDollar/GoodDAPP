// @flow
import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { forOwn, pickBy } from 'lodash'

class GoogleWrapper {
  // eslint-disable-next-line require-await
  async identify(userId) {
    const { gtag } = window

    gtag('set', { user_id: userId })
  }

  // eslint-disable-next-line require-await
  async setUserProperties(params = {}) {
    const { gtag } = window

    // set vars by one according data layer docs
    forOwn(params, (value, key) => gtag('set', { [key]: value }))
  }

  logEvent(event: string, data: any = {}) {
    const { gtag } = window

    gtag('event', event, data)
  }
}

export default () => {
  const { gtag } = window

  return pickBy({
    sentry: SentryWeb,
    googleAnalytics: gtag ? new GoogleWrapper() : null,
    amplitude: amplitude.getInstance(),
  })
}
