import React, { useCallback } from 'react'

import { useDialog } from '../../../lib/dialog/useDialog'
import NotificationsPermissionDialog from '../components/NotificationsPermissionDialog'

const useClaimNotificationsDialog = () => {
  const { showDialog } = useDialog()

  const askForClaimNotifications = useCallback(
    async (onConfirm, onDismiss) => {
      const onDialogResult = result => {
        onDismiss()

        if (true === result) {
          onConfirm()
        }
      }

      await showDialog({
        isMinHeight: false,
        showButtons: false,
        onDismiss,
        content: <NotificationsPermissionDialog onDismiss={onDialogResult} />,
      })
    },
    [showDialog],
  )

  return askForClaimNotifications
}

export default useClaimNotificationsDialog
