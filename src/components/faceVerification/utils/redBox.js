import { assign, get } from 'lodash'

import Config from '../../../../config/config'
import { isMobileNative } from '../../../../lib/utils/platform'

const unexpectedRe = /unexpected\s+issue/i
const criticalIssues = ['UnrecoverableError', 'NotSupportedError', 'ResourceLoadingError', 'UnableToWhitelist']

export const isCriticalIssue = exception => criticalIssues.includes(get(exception, 'name'))

export const hideRedBoxIfNonCritical = (exception, logCallback) => {
  if (unexpectedRe.test(exception.message || '') || isCriticalIssue(exception)) {
    logCallback()
    return
  }

  hideRedBox(logCallback)
}

export const hideRedBox = logCallback => {
  const { reportErrorsAsExceptions } = console

  if (!isMobileNative || Config.env === 'production' || !reportErrorsAsExceptions) {
    logCallback()
    return
  }

  // eslint-disable-next-line no-console
  console.reportErrorsAsExceptions = false
  logCallback()
  assign(console, { reportErrorsAsExceptions })
}
