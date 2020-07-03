import pino from 'pino'
import Config from '../../config/config'

const logger = pino({
  level: Config.logLevel,
})

logger.debug = logger.info
global.logger = logger

export default logger

export const ExceptionCategory = {
  Human: 'human',
  Blockhain: 'blockchain',
  Network: 'network',
  Unexpected: 'unexpected',
}
