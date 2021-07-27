if (typeof __dirname === 'undefined') global.__dirname = '/'
if (typeof __filename === 'undefined') global.__filename = ''
// Needed so that 'stream-http' chooses the right default protocol.
global.location = {
  protocol: 'file:',
}

global.process = require('process')
// global.process.version = 'v0.10';
global.process.browser = false
global.process.release = { name: 'gooddollar-wallet' }
const isDev = typeof __DEV__ === 'boolean' && __DEV__

process.env['NODE_ENV'] = isDev ? 'development' : 'production'
if (typeof localStorage !== 'undefined') {
  localStorage.debug = isDev ? '*' : ''
}

global.btoa = require('Base64').btoa
global.atob = require('Base64').atob
global.Buffer = require('buffer').Buffer
// global.crypto = require('crypto')
