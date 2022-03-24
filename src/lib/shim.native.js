import { XMLHttpRequest as XHR2 } from 'xhr2-cookies'
import './shim.common'
;(() => {
  const { prototype: __proto__ } = XHR2
  const { setRequestHeader } = __proto__
  __proto__.setRequestHeader = function(name, value) {
    this._restrictedHeaders.origin = false
    if ('user-agent' === name.toLowerCase()) {
      this._userAgent = value
      return
    }

    setRequestHeader.call(this, name, value)
  }
})()
