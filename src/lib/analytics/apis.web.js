// @flow
import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { forOwn, pickBy } from 'lodash'
import Mixpanel from 'mixpanel-browser'

import Config from '../../config/config'

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
  constructor(trackingId) {
    this.trackingId = trackingId

    const dataLayer = window.dataLayer || []

    this.gtag = function gtag() {
      dataLayer.push(arguments)
    }

    this.gtag('js', new Date())
    this.gtag('config', this.trackingId)
  }

  identify(userId) {
    this.gtag('set', { user_id: userId })
  }

  // eslint-disable-next-line require-await
  async setUserProperties(params = {}) {
    // set vars by one according data layer docs
    forOwn(params, (value, key) => this.gtag({ [key]: value }))
  }

  logEvent(eventName, eventData = {}) {
    this.gtag('event', eventName, eventData)
  }
}

export default () => {
  const { dataLayer } = window

  return pickBy({
    sentry: SentryWeb,
    googleAnalytics: dataLayer ? new GoogleWrapper(Config.gtagId) : null,
    amplitude: amplitude.getInstance(),
    mixpanel: MixpanelAPI,
  })
}
