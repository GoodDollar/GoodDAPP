import * as SentryWeb from '@sentry/browser'
import amplitude from 'amplitude-js'
import { pickBy, property, values, isFunction } from 'lodash'

const { mt, FS, dataLayer } = window

class FullStory {
  ready = false

  constructor(fsApi) {
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

    const proxyGetter = (target, property) => {
      const readFrom = [target, fsApi].find(object => property in object)

      if (!readFrom) {
        return
      }

      const value = readFrom[value]

      if (isFunction(value)) {
        return value.bind(readFrom)
      }

      return value
    }

    return new Proxy(this, { get: proxyGetter })
  }

  onReady(callback) {
    const { promise } = this

    return promise.then(callback)
  }
}

export default pickBy({
  mautic: mt,
  sentry: SentryWeb,
  googleAnalytics: dataLayer,
  amplitude: amplitude.getInstance(),
  fullStory: FS ? new FullStory(FS) : null,
})
