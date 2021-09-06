import Logger from 'js-logger'
import EventEmitter from 'eventemitter3'
import { assign } from 'lodash'

import Config from '../../config/config'

const emitter = new EventEmitter()
global.logger = Logger

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

export default Logger
