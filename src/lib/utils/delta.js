import Config from '../../config/config'
import { on } from '../analytics/analytics'
import logger from '../logger/js-logger'

const postMessage = data => {
  const { ReactNativeWebView, parent, opener } = window
  const messenger = ReactNativeWebView || parent || opener

  if (!messenger || 'function' !== typeof messenger.postMessage) {
    return
  }

  messenger.postMessage(data, '*')
}

if (Config.isDeltaApp) {
  on('fireEvent', data => postMessage({ type: 'event', ...data }))
  logger.on('*', ({ level, ...data }) => postMessage({ type: level.name, level, ...data }))
}
