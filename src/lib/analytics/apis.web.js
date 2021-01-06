// @flow
import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { assign, isFunction, pickBy } from 'lodash'

class FullStoryWrapper {
  ready = false

  constructor(fsApi, fsWrapper) {
    const { _fs_ready } = fsWrapper // eslint-disable-line camelcase

    this.promise = new Promise(
      resolve =>
        (fsWrapper._fs_ready = () => {
          if (isFunction(_fs_ready)) {
            _fs_ready()
          }

          this.ready = true
          resolve()
        }),
    )

    const get = (target, property) => {
      const readFrom = [target, fsApi].find(object => property in object)

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
  dataLayer = null

  constructor(dataLayer) {
    assign(this, { dataLayer })
  }

  logEvent(event: string, data: any = {}) {
    this.dataLayer.push({ event, ...data })
  }
}

export default () => {
  const { mt, FS, dataLayer } = window

  return pickBy({
    mautic: mt,
    sentry: SentryWeb,
    googleAnalytics: dataLayer ? new GoogleWrapper(dataLayer) : null,
    amplitude: amplitude.getInstance(),
    fullStory: FS ? new FullStoryWrapper(FS, window) : null,
  })
}
