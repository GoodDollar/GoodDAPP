import pino from 'pino'
import Config from '../../config/config'

const logger = pino({
  level: Config.logLevel,
})

logger.debug = logger.info
global.logger = logger

export default logger

export const ERROR_CATEGORY_HUMAN = 'human'
export const ERROR_CATEGORY_NETWORK = 'network'
export const ERROR_CATEGORY_BLOCKCHAIN = 'blockchain'
export const ERROR_CATEGORY_UNEXPECTED = 'unexpected'
