import { isArray, isDate, isPlainObject, mapValues } from 'lodash'
import Config from '../../config/config'
import { on } from '../analytics/analytics'
import logger from '../logger/js-logger'
import { isScalar } from './object'

const postMessage = data => {
  const messenger = window.ReactNativeWebView

  if ('undefined' === typeof messenger) {
    return
  }

  messenger.postMessage(JSON.stringify(data))
}

const transformValue = value => {
  if (isArray(value)) {
    return value.map(transformValue)
  }

  if (isPlainObject(value)) {
    return mapValues(value, transformValue)
  }

  if (!isScalar(value) || !isDate(value)) {
    return
  }

  return value
}

if (Config.isDeltaApp) {
  logger.on('*', ({ name, level, messages }) =>
    postMessage({
      name,
      level,
      type: level.name,
      messages: messages.map(transformValue),
    }),
  )

  on('fireEvent', ({ event, data }) =>
    postMessage({
      type: 'event',
      event,
      data,
    }),
  )
}
