import pino from 'pino'
import Config from '../../config/config'
import { fireEvent } from '../analytics/analytics'
declare var Rollbar
const logger = pino({
  level: Config.logLevel,
})
logger.debug = logger.info
let error = logger.error
logger.error = function() {
  fireEvent('ERROR_LOG', arguments)
  if (global.Rollbar && Config.env !== 'test') {
    Rollbar.error.apply(Rollbar, arguments)
  }
  return error.apply(logger, arguments)
}
global.logger = logger
export default logger
