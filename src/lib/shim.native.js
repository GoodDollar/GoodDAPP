import { forIn } from 'lodash'
import '@walletconnect/react-native-compat'
import BigInt from 'big-integer'
import { TextDecoder, TextEncoder } from 'text-encoding'
import SQLite from 'react-native-sqlite-2'
import { XMLHttpRequest as XHR2 } from 'xhr2-cookies'
import { setupURLPolyfill } from 'react-native-url-polyfill'
import setGlobalVars from '@indexeddbshim/indexeddbshim/dist/indexeddbshim-noninvasive'

import { shimGlboal } from './utils/shim'
import './shim.common'

const setupIndexedDBPolyfill = () => setGlobalVars(window, { checkOrigin: false, win: SQLite })

const setupXHRPolyfill = () => {
  const { prototype: __proto__ } = XHR2
  const { setRequestHeader } = __proto__

  __proto__.setRequestHeader = function(name, value) {
    const { _restrictedHeaders } = this

    switch (name.toLowerCase()) {
      case 'user-agent':
        this._userAgent = value
        return
      case 'origin':
        if ('origin' in _restrictedHeaders) {
          delete _restrictedHeaders.origin
        }
        break
      default:
        break
    }

    setRequestHeader.call(this, name, value)
  }
}

const setupWalletConnect = () => {
  // Required for TextEncoding Issue
  const wcPolyfills = { TextEncoder, TextDecoder, BigInt }

  // force shim
  forIn(wcPolyfills, (implementation, globalApi) => shimGlboal(globalApi, implementation, true))
}

setupXHRPolyfill()
setupURLPolyfill()
setupIndexedDBPolyfill()
setupWalletConnect()
