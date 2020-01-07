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
global.atob = require('Base64').atob;
global.Buffer = require('buffer').Buffer;

// isomorphic-webcrypto overwrites the navigator object to { userAgent = '' }
// Making the setter to do nothing in order to fix it
global.navigator.userAgent = ''
const navigatorCopy = { ...global.navigator }
Object.defineProperty(global, 'navigator', {
  set: () => {},
  get: () => navigatorCopy
});

