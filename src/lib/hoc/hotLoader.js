import { identity } from 'lodash'

import Config from '../../config/config'
import { isWeb } from '../utils/platform'

// wrap to hot loader in the dev build only (with also exclude test, staging & production)
const shouldWrap = isWeb && 'development' === Config.env
let hotWrapper = identity

if (shouldWrap) {
  const { hot, setConfig } = require('react-hot-loader')

  setConfig({ logLevel: 'debug' })
  hotWrapper = hot
}

/*
  Hot reloads components for web-ONLY as react-native already has built-in hot refresher
*/
export default hotWrapper
