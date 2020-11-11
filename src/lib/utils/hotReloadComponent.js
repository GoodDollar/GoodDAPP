import Config from '../../config/config'
import { isWeb } from './platform'

const runningTests = Config.env === 'test'

/*
  Hot reloads components for web-ONLY as react-native already has built-in hot refresher
*/
const hotReloadComponent = Component => {
  if (isWeb && !runningTests) {
    const { hot } = require('react-hot-loader/root')
    return hot(Component)
  }

  return Component
}

export default hotReloadComponent
