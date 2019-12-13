import pino from 'pino'
import { reportToSentry } from '../analytics/sentry'
import Config from '../../config/config'

const logger = pino({
  level: Config.logLevel,
})

logger.debug = logger.info
logger._error = logger.error

global.logger = logger

Object.defineProperties(logger, {
  error: {
    value: function(...args) {
      const cloneArgs = args.slice()
      const errorText = cloneArgs[0]
      const extraData = cloneArgs.splice(1)

      reportToSentry(errorText, {
        data: extraData,
      })

      this._error(...args)
    },
  },
})

export default logger
