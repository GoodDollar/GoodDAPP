import { useCallback, useEffect, useRef } from 'react'

import { useDialog } from '../../../../lib/undux/utils/dialog'

import { isCriticalIssue } from '../utils/kindOfTheIssue'
import { isWeb } from '../../../../lib/utils/platform'

import pino from '../../../../lib/logger/pino-logger'

const defaultLogger = pino.child({ from: 'useFaceTecCriticalErrorHandler' })

let faceTecCriticalError = null

export default (logger = null) => {
  const [showDialog] = useDialog()
  const showDialogRef = useRef(showDialog)
  const loggerRef = useRef(logger || defaultLogger)

  const handleCriticalError = useCallback(exception => {
    const { name, message } = exception

    // if not critical issue - skipping further checks
    if (!isCriticalIssue(exception)) {
      return
    }

    // if exception isn't set yet - set it
    if (!faceTecCriticalError) {
      faceTecCriticalError = exception
    }

    // if running native, skipping resource error check
    if (!isWeb) {
      return
    }

    // if not an sdk resource error - skipping
    if (name !== 'ResourceLoadingError') {
      return
    }

    // otherwise logging loading error and  showing reload popup
    loggerRef.current.error('Failed to preload FaceTec SDK', message, exception, { dialogShown: true })

    showDialogRef.current({
      type: 'error',
      isMinHeight: false,
      message: "We couldn't start face verification,\nplease reload the app.",
      onDismiss: () => window.location.reload(true),
      buttons: [
        {
          text: 'REFRESH',
        },
      ],
    })
  }, [])

  useEffect(() => {
    showDialogRef.current = showDialog
    loggerRef.current = logger || defaultLogger
  }, [logger, showDialog])

  return [faceTecCriticalError, handleCriticalError]
}
