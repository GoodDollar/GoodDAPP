// @flow
import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { pickBy } from 'lodash'

class GoogleWrapper {
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
