import pino from 'pino'
import { assign, omit, values } from 'lodash'
import EventEmitter from 'eventemitter3'

import Config from '../../config/config'

import { isE2ERunning } from '../utils/platform'

export const LogEvent = {
  Log: 'log',
  Error: 'error',
  Fatal: 'fatal',
  Warning: 'warn',
  Info: 'info',
  Trace: 'trace',
}

const emitter = new EventEmitter()
const logger = pino({ level: Config.logLevel })

logger.on = emitter.on.bind(emitter)

values(omit(LogEvent, 'Log')).forEach(level => {
  // logger.debug = logger.info hack
  const proxy = logger[level === 'debug' ? 'info' : level].bind(logger)
  const events = [LogEvent.Log, level]

  logger[level] = (...args) => {
    events.filter(event => emitter.listenerCount(event)).forEach(event => emitter.emit(event, ...args))

    return proxy(...args)
  }
})

if (isE2ERunning) {
  assign(global, { logger })
}

export default logger
