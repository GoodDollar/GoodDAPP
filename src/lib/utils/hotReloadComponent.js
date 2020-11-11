import { isWeb } from './platform'

/*
  Hot reloads components for web-ONLY as react-native already has built-in hot refresher
*/
const hotReloadComponent = Component => {
  if (isWeb) {
    const { hot } = require('react-hot-loader/root')
    return hot(Component)
  }

  return Component
}

export default hotReloadComponent
