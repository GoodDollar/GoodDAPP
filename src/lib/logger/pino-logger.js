import pino from 'pino'
import Config from '../../config/config'

const logger = pino({
  level: Config.logLevel,
})

logger.debug = logger.info
global.logger = logger

export default logger

export const logErrorWithDialogShown = (logInstance, ...args) => {
  const extra = args[3] || {}

  extra.dialogShown = true

  logInstance.error(...args)
}
