import pino from 'pino'

const logger = pino({
  level: 'debug'
})
logger.debug = logger.info
export default logger
