import { useCallback } from 'react'
import { t } from '@lingui/macro'

import { useDialog } from '../../../../lib/dialog/useDialog'
import useRealtimeProps from '../../../../lib/hooks/useRealtimeProps'

import { isCriticalIssue } from '../utils/redBox'
import { isWeb } from '../../../../lib/utils/platform'

import FaceTecGlobalState from '../sdk/FaceTecGlobalState'

export default (logger = null) => {
  const { showDialog } = useDialog()
  const accessors = useRealtimeProps([logger, showDialog])

  const handleCriticalError = useCallback(
    exception => {
      const { faceTecCriticalError } = FaceTecGlobalState
      const { name, message } = exception
      const [getLogger, showDialog] = accessors
      const log = getLogger()

      // if not critical issue - skipping further checks
      if (!isCriticalIssue(exception)) {
        return
      }

      // if exception isn't set yet - set it
      if (!faceTecCriticalError) {
        FaceTecGlobalState.faceTecCriticalError = exception
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
      log.error('Failed to preload FaceTec SDK', message, exception, { dialogShown: true })

      showDialog({
        type: 'error',
        isMinHeight: false,
        message: t`We couldn't start face verification` + '\n' + t`please reload the app.`,
        onDismiss: () => window.location.reload(true),
        buttons: [
          {
            text: 'REFRESH',
          },
        ],
      })
    },
    [accessors],
  )

  return handleCriticalError
}
