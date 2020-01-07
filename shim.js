if (typeof global.self === 'undefined') {
  global.self = global
}

if (typeof __dirname === 'undefined') global.__dirname = '/'
if (typeof __filename === 'undefined') global.__filename = ''

global.process = require('process');
global.process.version = 'v0.10';
global.process.browser = false;

const isDev = typeof __DEV__ === 'boolean' && __DEV__

process.env['NODE_ENV'] = isDev ? 'development' : 'production'
if (typeof localStorage !== 'undefined') {
  localStorage.debug = isDev ? '*' : ''
}

global.btoa = require('Base64').btoa;
global.Buffer = require('buffer').Buffer;

if (typeof navigator === 'undefined') global.navigator = {}

global.navigator.product = 'ReactNative'
