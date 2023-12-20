import { useCallback, useMemo } from 'react'
import { t } from '@lingui/macro'

import { usePosthogClient } from '../../lib/hooks/usePosthogClient'
import { useDialog } from '../../lib/dialog/useDialog'

export const useSecurityDialog = () => {
  const posthog = usePosthogClient()
  const payload = useMemo(() => (posthog ? posthog.getFeatureFlagPayload('security-dialog') : [posthog]))

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

  return { securityEnabled: enabled, securityDialog, posthog }
}
