import 'fake-indexeddb/auto'
import any from 'promise.any'
import { assign, noop } from 'lodash'
import { Crypto } from 'node-webcrypto-ossl'
import { TextEncoder, TextDecoder } from 'util'

// import initGunDB from '../src/lib/gundb/gundb'
import '../src/lib/shim'

jest.setTimeout(10000)
if (typeof Promise.any !== 'function') {
  any.shim()
}

if (typeof window !== 'undefined') {
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = () => ({
      fillRect: noop
    })
  }

  window.crypto = new Crypto()
  window.matchMedia = () => ({ matches: true });
  assign(window, { TextDecoder, TextEncoder })
}

if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'userAgent', {
    get() {
      return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36'
    }
  })
}
