import { noop } from 'lodash'
import React, { useCallback } from 'react'

import { useDialog } from '../../../lib/dialog/useDialog'
import NotificationsPermissionDialog from '../components/NotificationsPermissionDialog'

const useClaimNotificationsDialog = () => {
  const { showDialog } = useDialog()

  const askForClaimNotifications = useCallback(
    onConfirmed => {
      const onDialogResult = result => (true === result ? onConfirmed : noop)()

      showDialog({
        isMinHeight: false,
        showButtons: false,
        onDismiss: noop,
        content: <NotificationsPermissionDialog onDismiss={onDialogResult} />,
      })
    },
    [showDialog],
  )

  return askForClaimNotifications
}

export default useClaimNotificationsDialog
