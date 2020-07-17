import { over, trimEnd } from 'lodash'

const TRIM_URL_CHARS = ' /#'

export default new class {
  listeners = {}

  constructor() {
    const { onMessage } = this

    window.addEventListener('message', onMessage)

    // stop listeting iframe events before unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('message', onMessage)
    })
  }

  addListener(src, listener) {
    const { listeners } = this
    const pageSource = trimEnd(src, TRIM_URL_CHARS)
    let srcListeners = listeners[pageSource]

    if (!srcListeners) {
      srcListeners = []
      listeners[pageSource] = srcListeners
    }

    srcListeners.push(listener)
  }

  removeListener(src, listener) {
    const { listeners } = this
    const pageSource = trimEnd(src, TRIM_URL_CHARS)
    const srcListeners = listeners[pageSource]

    if (!srcListeners) {
      return
    }

    const listenerIndex = srcListeners.indexOf(listener)

    if (listenerIndex < 0) {
      return
    }

    srcListeners.splice(listenerIndex, 1)
  }

  /** @private */
  onMessage = messageEvent => {
    const { listeners } = this
    const { src, target, event } = messageEvent.data
    const pageSource = trimEnd(src, TRIM_URL_CHARS)
    const srcListeners = listeners[pageSource]

    if (srcListeners && 'DOMContentLoaded' === event && 'iframe' === target) {
      over(srcListeners)(messageEvent)

      delete listeners[pageSource]
    }
  }
}()
