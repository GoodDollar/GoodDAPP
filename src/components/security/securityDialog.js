import { useCallback } from 'react'
import { t } from '@lingui/macro'

import { useDialog } from '../../lib/dialog/useDialog'
import { useFlagWithPayload } from '../../lib/hooks/useFeatureFlags'

export const useSecurityDialog = () => {
  const payload = useFlagWithPayload('security-dialog')

  const { enabled, dialogTitle, dialogText, withButtons } = payload || {}
  const { showDialog } = useDialog()

  const securityDialog = useCallback(
    () =>
      showDialog({
        title: t`${dialogTitle}`,
        message: t`${dialogText}`,
        showCloseButtons: withButtons,
        showButtons: withButtons,
      })[showDialog],
  )

  return { securityEnabled: enabled, securityDialog }
}
