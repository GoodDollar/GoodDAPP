require('node-libs-react-native/globals')

global.navigator.userAgent = ''
const navigatorCopy = { ...global.navigator }
Object.defineProperty(global, 'navigator', {
  set: () => {},
  get: () => navigatorCopy
});

