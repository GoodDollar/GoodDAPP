import { useCallback, useMemo } from 'react'
import { t } from '@lingui/macro'
import { usePostHog } from 'posthog-react-native'

import { useDialog } from '../../lib/dialog/useDialog'

export const useSecurityDialog = () => {
  const posthog = usePostHog()
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
