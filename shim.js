require('node-libs-react-native/globals')

const isDev = typeof __DEV__ === 'boolean' && __DEV__
const base64 = require('Base64')

global.btoa = base64.btoa
global.atob = base64.atob

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
