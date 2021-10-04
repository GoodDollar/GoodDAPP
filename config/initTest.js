import 'fake-indexeddb/auto'
import any from 'promise.any'
import { noop } from 'lodash'

import initGunDB from '../src/lib/gundb/gundb'
import '../src/lib/shim'

if (typeof Promise.any !== 'function') {
  any.shim()
}

if (typeof window !== 'undefined') {
  const crypto = new (require('node-webcrypto-ossl'))()
  const { TextEncoder, TextDecoder } = require('text-encoding', 1)

  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = () => ({
      fillRect: noop
    })
  }

  window.matchMedia = () => ({ matches: true });
  window.crypto = crypto
  window.TextDecoder = TextDecoder
  window.TextEncoder = TextEncoder
}

if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'userAgent', {
    get() {
      return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36'
    }
  })
}
