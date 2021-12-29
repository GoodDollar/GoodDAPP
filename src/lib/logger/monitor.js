import { isError, isString } from 'lodash'
import { setUncaughExceptionHandler, setUnhandledRejectionHanlder } from '../exceptions/handlers'

export const addLoggerMonitor = logger => {
  const log = logger.child({ from: 'GoodDAPP' })

  // add logging of uncaught exceptions
  setUncaughExceptionHandler(exception => {
    const { message } = exception

    log.error('Uncaught exception at:', message, exception)
  })

  // add logging of unhandled promise rejections
  setUnhandledRejectionHanlder(reason => {
    let message = ''
    let logPayload = {}
    let exception = reason
    const label = 'Unhandled promise rejection'

    if (isError(reason)) {
      message = reason.message
    } else {
      if (isString(reason)) {
        message = reason
      } else {
        logPayload = { reason }
      }

      exception = new Error(message || label)
    }

    log.error(`${label} at:`, message, exception, logPayload)
  })
}
