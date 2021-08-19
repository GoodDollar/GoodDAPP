import initGunDB from '../src/lib/gundb/gundb'
import any from 'promise.any'

if (typeof Promise.any !== 'function') {
  any.shim()
}

if (typeof window !== 'undefined') {
  const crypto = new (require('node-webcrypto-ossl'))()
  const { TextEncoder, TextDecoder } = require('text-encoding', 1)

    if (typeof HTMLCanvasElement !== 'undefined') {
    // taken from https://stackoverflow.com/questions/48828759/jest-and-jsdom-error-with-canvas
      HTMLCanvasElement.prototype.getContext = () => {
        // return whatever getContext has to return
      };
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
