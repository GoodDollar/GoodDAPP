// @flow
import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { forOwn, pickBy } from 'lodash'
import Mixpanel from 'mixpanel-browser'

const MixpanelAPI = {
  // eslint-disable-next-line require-await
  async init(...params) {
    Mixpanel.init(...params)
    return this
  },
  registerSuperProperties(...params) {
    Mixpanel.register(...params)
  },
  registerSuperPropertiesOnce(...params) {
    Mixpanel.register_once(...params)
  },

  identify(...params) {
    Mixpanel.identify(...params)
  },
  track(...params) {
    Mixpanel.track(...params)
  },
  setUserProps(props) {
    return Mixpanel.people.set(props)
  },
  setUserPropsOnce(props) {
    return Mixpanel.people.set_once(props)
  },
}

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
    mixpanel: MixpanelAPI,
  })
}
