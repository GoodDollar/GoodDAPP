import React, { useCallback } from 'react'

import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/NotificationPermission.svg'

export default ({ onDismiss, onCancel }) => {
  const onPrompt = useCallback(() => onDismiss(true), [onDismiss])

  return (
    <ExplanationDialog
      title={t`Would you like to be reminded of your daily claims?`}
      image={illustration}
      buttonsContainerStyle={{
        flexDirection: 'column',
      }}
      buttons={[
        {
          text: t`ENABLE NOTIFICATIONS`,
          action: onPrompt,
          style: { width: '100%', marginBottom: 8 },
        },
        {
          text: t`MAYBE LATER`,
          action: onDismiss,
          mode: 'text',
        },
      ]}
    />
  )
}

/*
 - Usage example

const { showDialog } = useDialog()

showDialog({
  content: <CameraPermissionDialog />,
  isMinHeight: false,
  showButtons: false,
  buttons: [
    {
      text: 'OK',
      onPress: dismiss => {
        // do something
        dismiss()
      },
    },
  ],
})
*/
