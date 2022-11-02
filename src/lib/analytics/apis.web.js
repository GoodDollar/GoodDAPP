// @flow
import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { forOwn, pickBy } from 'lodash'

class GoogleWrapper {
  // eslint-disable-next-line require-await
  async setDefaultParams(params = {}) {
    const { dataLayer } = window

    // set vars by one according data layer docs
    forOwn(params, (value, key) => dataLayer.push({ [key]: value }))
  }

  logEvent(event: string, data: any = {}) {
    const { dataLayer } = window

    dataLayer.push({ event, ...data })
  }
}

export default () => {
  const { dataLayer } = window

  return pickBy({
    sentry: SentryWeb,
    googleAnalytics: dataLayer ? new GoogleWrapper() : null,
    amplitude: amplitude.getInstance(),
  })
}
