import Logger from 'js-logger'
import EventEmitter from 'eventemitter3'
import Config from '../../config/config'

const emitter = new EventEmitter()
Logger.useDefaults({
  defaultLevel: Logger[Config.logLevel.toUpperCase()],
  formatter: (messages, context) => {
    if (context.name) {
      messages.unshift({ from: context.name })
    }
    emitter.emit(context.level.name, messages)
  },
})

const logger = Logger

// adding .on() method to listen logger events
// this allows other services (e.g. analytics)
// to listen for a specific log messages (e.g. errors)
logger.on = emitter.on.bind(emitter)
global.logger = logger

export default logger
