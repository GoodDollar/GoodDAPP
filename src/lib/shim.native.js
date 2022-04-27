import { setupURLPolyfill } from 'react-native-url-polyfill'
import { XMLHttpRequest as XHR2 } from 'xhr2-cookies'
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

setupXHRPolyfill()
setupURLPolyfill()
