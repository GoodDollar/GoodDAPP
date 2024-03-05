import Logger from 'js-logger'
import EventEmitter from 'eventemitter3'
import { assign, isError, isString, noop, toArray } from 'lodash'

import Config from '../../config/config'
import { addLoggerMonitor } from './monitor'

const connectionErrorRegex = /((connection|network) (error|timeout)|invalid json rpc|too many requests)/i
const rateLimitErrorRegex = /too many requests|Failed to validate quota usage/i

export const isConnectionError = error => {
  const isException = isError(error)

  if (!isException && !isString(error)) {
    return false
  }

  return connectionErrorRegex.test(isException ? error.message : error || '')
}

export const isRateLimitError = reasonThrown => {
  const isException = isError(reasonThrown)

  if (!isException && !isString(reasonThrown) && !('error' in reasonThrown)) {
    return false
  }

  return rateLimitErrorRegex.test(isException ? reasonThrown.message : reasonThrown.error?.message ?? reasonThrown)
}

const emitter = new EventEmitter()
const logLevel = Logger[Config.logLevel.toUpperCase()]

// set formatter to noop to disable built-in formatter
const consoleHandler = Logger.createDefaultHandler({ formatter: noop })

const formatter = (messages, context) => {
  const { name, level } = context

  if (name) {
    messages.unshift({ from: name })
  }

  emitter.emit(level.name, ...messages)
}

const addLogException = logger => {
  const { error } = logger

  return assign(logger, {
    exception: error,
    error: function () {
      if (toArray(arguments).some(isConnectionError)) {
        return
      }

      error.apply(this, arguments)
    },
  })
}

// by default log all, will print on console only if log level enabled
Logger.setLevel(Logger.TRACE)

Logger.setHandler((args, context) => {
  // convert messages to the strict array
  // this had been taken from js-logger source
  const messages = Array.prototype.slice.call(args)

  // call our formatter to prepare messages and fire event
  formatter(messages, context)

  // if log level enabled - print on console
  if (context.level.value >= logLevel.value) {
    consoleHandler(messages, context)
  }
})

assign(Logger, {
  // adding .on() method to listen logger events
  // this allows other services (e.g. analytics)
  // to listen for a specific log messages (e.g. errors)
  on: emitter.on.bind(emitter),

  // adding .child method to keep pino's interface
  child: ({ from }) => addLogException(Logger.get(from)),
})

// add logging of unhandled promise rejections and uncaught exceptions
addLoggerMonitor(Logger)
addLogException(Logger)
global.logger = Logger

export default Logger
