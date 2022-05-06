import { setupURLPolyfill } from 'react-native-url-polyfill'
import { XMLHttpRequest as XHR2 } from 'xhr2-cookies'
import SQLite from 'react-native-sqlite-2'
import setGlobalVars from '@indexeddbshim/indexeddbshim/dist/indexeddbshim-noninvasive'
import './shim.common'

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

//shim indexdb
setGlobalVars(window, { checkOrigin: false, win: SQLite })
setupXHRPolyfill()
setupURLPolyfill()
