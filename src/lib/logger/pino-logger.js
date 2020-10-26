import pino from 'pino'
import { omit, values } from 'lodash'
import EventEmitter from 'eventemitter3'

import Config from '../../config/config'

export const LogEvent = {
  Log: 'log',
  Error: 'error',
  Fatal: 'fatal',
  Warning: 'warn',
  Info: 'info',
  Trace: 'trace',
  Debug: 'debug',
}

const emitter = new EventEmitter()
const logger = pino({ level: Config.logLevel })

// adding .on() method to listen logger events
// this allows other services (e.g. analytics)
// to listen for a specific log messages (e.g. errors)
logger.on = emitter.on.bind(emitter)
global.logger = logger

// overriding log levels methods to emit corresponding event additionally
values(omit(LogEvent, 'Log')).forEach(level => {
  // logger.debug = logger.info hack
  const proxy = logger[level === 'debug' ? 'info' : level].bind(logger)
  const events = [LogEvent.Log, level]

  logger[level] = (...args) => {
    const result = proxy(...args)

    events.filter(event => emitter.listenerCount(event)).forEach(event => emitter.emit(event, ...args))
    return result
  }
})

export default logger
