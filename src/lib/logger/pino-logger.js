import pino from 'pino'
import EventEmitter from 'eventemitter3'

//import { isE2ERunning } from '../utils/platform'
import Config from '../../config/config'

export const ExceptionCategory = {
  Human: 'human',
  Blockchain: 'blockchain',
  Network: 'network',
  Unexpected: 'unexpected',
}

export const LogEvent = {
  Log: 'log',
  Error: 'error',
  Fatal: 'fatal',
  Warning: 'warn',
  Info: 'info',
  Trace: 'trace',
}

const emitter = new EventEmitter()

const logger = pino({
  level: Config.logLevel,
  browser: {
    transmit: {
      // transmit.level property specifies the minimum level (inclusive) of when the send fn should be called
      level: LogEvent.Error,
      send: (level, logEvent) => {
        const events = [LogEvent.Log, level]

        events.forEach(event => emitter.emit(event, logEvent))
      },
    },
  },
})

export const addLoggingListener = emitter.on.bind(emitter)

logger.debug = logger.info

//if (isE2ERunning) {
Object.assign(global, { logger })

//}

export default logger
