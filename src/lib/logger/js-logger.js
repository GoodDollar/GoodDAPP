import Logger from 'js-logger'
import EventEmitter from 'eventemitter3'
import { assign } from 'lodash'

import Config from '../../config/config'
import { addLoggerMonitor } from './monitor'

const emitter = new EventEmitter()

// this isn't a hook, but eslint reports warning wrongly
// eslint-disable-next-line react-hooks/rules-of-hooks
Logger.useDefaults({
  defaultLevel: Logger[Config.logLevel.toUpperCase()],
  formatter: (messages, context) => {
    const { name, level } = context

    if (name) {
      messages.unshift({ from: name })
    }

    // log arguments was passed to event handlers as spread array
    // e.g. log('error', a, b, c) => (context, a, b, c) not ([context, a, b, c])
    emitter.emit(level.name, ...messages)
  },
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
