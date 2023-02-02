// @flow
import * as sentry from '@sentry/react-native'
import { Amplitude, Identify } from '@amplitude/react-native'
import analytics from '@react-native-firebase/analytics'
import { assign, isFunction, noop } from 'lodash'
import { Mixpanel } from 'mixpanel-react-native'

// eslint-disable-next-line require-await
Mixpanel.prototype.setUserProps = async function(props) {
  return this.getPeople().set(props)
}
// eslint-disable-next-line require-await
Mixpanel.prototype.setUserPropsOnce = async function(props) {
  return this.getPeople().setOnce(props)
}

const MixpanelAPI = {
  async init(apiKey) {
    // eslint-disable-next-line no-return-await
    return await Mixpanel.init(apiKey, false)
  },
}

class GoogleWrapper {
  constructor(analytics) {
    assign(this, { analytics })
  }

  async setDefaultParams(params = {}) {
    await analytics.setDefaultEventParameters(params)
  }

  logEvent(event: string, data: any = {}) {
    const { analytics } = this

    analytics.logEvent(event, data)
  }
}

class AmplitudeWrapper {
  constructor(instance, identityClass) {
    const initialize = (apiKey, userId, options, onReady) => {
      const { onError = noop } = options || {}
      const onSuccess = onReady || noop

      instance
        .init(apiKey)
        // eslint-disable-next-line require-await
        .then(async initialized => {
          if (!initialized) {
            throw new Error('Amplitude not initialized !')
          }

          onSuccess()
        })
        .catch(onError)
    }

    return new Proxy(this, {
      get: (target, property) => {
        let propertyValue

        switch (property) {
          case 'Identify':
            return identityClass
          case 'init':
            return initialize
          case 'setVersionName':
            return noop // there's no setVersionName() on the native SDK
          default:
            propertyValue = instance[property]

            if (isFunction(propertyValue)) {
              propertyValue = propertyValue.bind(instance)
            }

            return propertyValue
        }
      },
    })
  }
}

export default () => {
  const amplitude = new AmplitudeWrapper(Amplitude.getInstance(), Identify)
  const googleAnalytics = new GoogleWrapper(analytics())
  const mixpanel = MixpanelAPI
  return { sentry, amplitude, googleAnalytics, mixpanel }
}
