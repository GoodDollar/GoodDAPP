// @flow
import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { isFunction, pickBy } from 'lodash'

class FullStoryWrapper {
  ready = false

  constructor() {
    const { _fs_ready, FS } = window // eslint-disable-line camelcase

    this.promise = new Promise(
      resolve =>
        (window._fs_ready = () => {
          if (isFunction(_fs_ready)) {
            _fs_ready()
          }

          this.ready = true
          resolve()
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
    const { dataLayer } = window

    dataLayer.push({ event, ...data })
  }
}

export default () => {
  const { FS, dataLayer } = window

  return pickBy({
    sentry: SentryWeb,
    googleAnalytics: dataLayer ? new GoogleWrapper() : null,
    amplitude: amplitude.getInstance(),
    fullStory: FS ? new FullStoryWrapper() : null,
  })
}
