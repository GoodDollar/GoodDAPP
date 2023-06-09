// @flow
import * as sentry from '@sentry/react-native'
import { Amplitude, Identify } from '@amplitude/react-native'
import FireBaseAnalytics from '@react-native-firebase/analytics'
import { assign, isFunction, mapValues, noop } from 'lodash'
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
    const mixpanel = new Mixpanel(apiKey, false)

    // https://github.com/mixpanel/mixpanel-react-native/issues/162
    await mixpanel.init()
    return mixpanel
  },
}

class GoogleWrapper {
  constructor(analytics) {
    assign(this, { analytics })
  }

  async identify(userId) {
    const { analytics } = this

    await analytics.setUserId(userId)
  }

  async setUserProperties(params = {}) {
    const { analytics } = this
    const mappedParams = mapValues(params, String)
    await analytics.setUserProperties(mappedParams)
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
  const googleAnalytics = new GoogleWrapper(FireBaseAnalytics())
  const mixpanel = MixpanelAPI
  return { sentry, amplitude, googleAnalytics, mixpanel }
}
