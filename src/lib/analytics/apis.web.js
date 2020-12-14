// @flow
import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { assign, isFunction, pickBy } from 'lodash'
import { convertToGoogleAnalytics } from './utils'

const { mt, FS, dataLayer } = window

class FullStoryWrapper {
  ready = false

  constructor() {
    const { _fs_ready } = window // eslint-disable-line camelcase

    this.promise = new Promise(resolve =>
      assign(window, {
        _fs_ready: () => {
          if (isFunction(_fs_ready)) {
            _fs_ready()
          }

          this.ready = true
          resolve()
        },
      }),
    )

    const get = (target, property) => {
      const readFrom = [target, FS].find(object => property in object)

      if (!readFrom) {
        return
      }

      const value = readFrom[property]

      if (isFunction(value)) {
        return value.bind(readFrom)
      }

      return value
    }

    return new Proxy(this, { get })
  }

  onReady(callback) {
    const { promise } = this

    return promise.then(callback)
  }
}

class GoogleWrapper {
  logEvent(event: string, data: any = {}) {
    const [eventName, eventData] = convertToGoogleAnalytics(event, data)

    dataLayer.push({ event: eventName, ...eventData })
  }
}

export default pickBy({
  mautic: mt,
  sentry: SentryWeb,
  googleAnalytics: dataLayer ? new GoogleWrapper() : null,
  amplitude: amplitude.getInstance(),
  fullStory: FS ? new FullStoryWrapper() : null,
})
