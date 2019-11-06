import pino from 'pino'
import Config from '../../config/config'
declare var Rollbar
const logger = pino({
  level: Config.logLevel,
})
logger.debug = logger.info
let error = logger.error
logger.error = function() {
  if (global.bugsnagClient && Config.env !== 'test') {
    let [logContext, logMessage, eMsg, error, ...rest] = arguments
    global.bugsnagClient.notify(logMessage, { context: logContext.from, metaData: { logMessage, eMsg, error, rest } })
  }
  if (global.Rollbar && Config.env !== 'test') {
    Rollbar.error.apply(Rollbar, arguments)
  }
  return error.apply(logger, arguments)
}
global.logger = logger
export default logger
