import { XMLHttpRequest as XHR2 } from 'xhr2-cookies'
import 'node-libs-react-native/globals'

const isDev = typeof __DEV__ === 'boolean' && __DEV__

process.browser = false
process.release = { name: 'gooddollar-wallet' }
process.env['NODE_ENV'] = isDev ? 'development' : 'production'

if (typeof localStorage !== 'undefined') {
  localStorage.debug = isDev ? '*' : ''
}

if (typeof __dirname === 'undefined') {
  global.__dirname = '/'
}

if (typeof __filename === 'undefined') {
  global.__filename = ''
}

;(() => {
  const { prototype: __proto__ } = XHR2
  const { setRequestHeader } = __proto__

  __proto__.setRequestHeader = function (name, value) {
    if ('user-agent' === name.toLowerCase()) {
      this._userAgent = value
      return
    }

    setRequestHeader.call(this, name, value)
  }
})()