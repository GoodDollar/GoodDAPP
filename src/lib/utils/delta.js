import Config from '../../config/config'
import { on } from '../analytics/analytics'

const postMessage = data => {
  const messenger = window.ReactNativeWebView

  if ('undefined' === typeof messenger) {
    return
  }

  messenger.postMessage(JSON.stringify(data))
}

if (Config.isDeltaApp) {
  on('*', (event, data) =>
    postMessage({
      type: event,
      ...data,
    }),
  )
}
