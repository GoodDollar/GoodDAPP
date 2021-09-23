import EventEmitter from 'eventemitter3'
import { trimEnd } from 'lodash'

const TRIM_URL_CHARS = ' /#'

export default new (class {
  emitter = new EventEmitter()

  constructor() {
    const { onMessage } = this

    window.addEventListener('message', onMessage)

    // stop listeting iframe events before unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('message', onMessage)
    })
  }

  addListener(src, listener) {
    const { emitter } = this
    const pageSource = trimEnd(src, TRIM_URL_CHARS)

    emitter.once(pageSource, listener)
  }

  removeListener(src, listener) {
    const { emitter } = this
    const pageSource = trimEnd(src, TRIM_URL_CHARS)

    emitter.off(pageSource, listener)
  }

  /** @private */
  onMessage = messageEvent => {
    const { emitter } = this
    const { src, target, event } = messageEvent.data
    const pageSource = trimEnd(src, TRIM_URL_CHARS)

    if ('DOMContentLoaded' === event && 'iframe' === target) {
      emitter.emit(pageSource)
    }
  }
})()
