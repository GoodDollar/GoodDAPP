import { identity } from 'lodash'

import Config from '../../config/config'
import { isWeb } from '../utils/platform'

// wrap to hot loader in the dev build only (with also exclude test, staging & production)
const shouldWrap = isWeb && 'development' === Config.env
let hotWrapper = identity

if (shouldWrap) {
  /*
    hot needs to imported from /root to use their new and more stable API, old API could cause problems
    issue example: https://github.com/gaearon/react-hot-loader/issues/1228
  */
  const { hot } = require('react-hot-loader/root')
  const { setConfig } = require('react-hot-loader')

  setConfig({ logLevel: 'debug' })
  hotWrapper = hot
}

/*
  Hot reloads components for web-ONLY as react-native already has built-in hot refresher
*/
export default hotWrapper
