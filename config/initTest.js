import 'fake-indexeddb/auto'
import any from 'promise.any'
import { assign, noop } from 'lodash'
import Crypto from 'crypto'
import dns from 'dns'
import { TextEncoder, TextDecoder } from 'util'
import '../src/lib/shim'
import dotenv from 'dotenv'
import FaceTecSDK from '@gooddollar/react-native-facetec/web/sdk/FaceTecSDK.web'

dotenv.config({ path: './.env.test' })

dns.setDefaultResultOrder('ipv4first') //required for resolving correctly localhost
jest.setTimeout(30000)


jest.mock("react-native-localize", () => {
  return {
    getLocales: jest.fn(),
    // you can add other functions mock here that you are using
  };
});

jest.mock("react-native-svg", () => {
  return {    
  };
});

jest.mock('react-native-vector-icons/lib/NativeRNVectorIcons', () => {
  return {}
})

if (typeof Promise.any !== 'function') {
  any.shim()
}

if (typeof window !== 'undefined') {
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = () => ({
      fillRect: noop
    })
  }

  window.crypto = Crypto.webcrypto
  window.matchMedia = () => ({ matches: true });
  assign(window, { TextDecoder, TextEncoder, FaceTecSDK: FaceTecSDK.FaceTecSDK })
}
window.setImmediate = window.setTimeout

if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'userAgent', {
    get() {
      return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36'
    }
  })
}
