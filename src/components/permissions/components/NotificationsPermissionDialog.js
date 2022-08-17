import React from 'react'

import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/NotificationPermission.svg'

export default ({ onDismiss, hideDialog, onCancel }) => (
  <ExplanationDialog
    title={t`Would you like to be reminded of your daily claims?`}
    image={illustration}
    buttonsContainerStyle={{
      flexDirection: 'column',
    }}
    buttons={[
      {
        text: t`ENABLE NOTIFICATIONS`,
        action: () => {
          onDismiss()
          hideDialog()
        },
        style: { width: '100%', marginBottom: 8 },
      },
      {
        text: t`MAYBE LATER`,
        action: () => {
          onCancel()
          hideDialog()
        },
        mode: 'text',
      },
    ]}
  />
)

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
