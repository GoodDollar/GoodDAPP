import Logger from 'js-logger'
import EventEmitter from 'eventemitter3'
import { assign, noop } from 'lodash'

import Config from '../../config/config'
import { addLoggerMonitor } from './monitor'

const emitter = new EventEmitter()
const logLevel = Logger[Config.logLevel.toUpperCase()]

// set formatter to noop to disable built-in formatter
const consoleHandler = Logger.createDefaultHandler({ formatter: noop })

const formatter = (messages, context) => {
  const { name, level } = context

  if (name) {
    messages.unshift({ from: name })
  }

  // log arguments was passed to event handlers as spread array
  // e.g. log('error', a, b, c) => (context, a, b, c) not ([context, a, b, c])
  emitter.emit(level.name, ...messages)
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
  child: ({ from }) => Logger.get(from),
})

// add logging of unhandled promise rejections and uncaught exceptions
addLoggerMonitor(Logger)
global.logger = Logger

export default Logger
