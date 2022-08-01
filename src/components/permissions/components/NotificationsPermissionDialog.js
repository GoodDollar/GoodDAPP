import React from 'react'

import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/NotificationPermission.svg'

// TODO: add image, change texts
export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Would you like to be reminded of your daily claims?`}
    image={illustration}
    buttons={[
      {
        text: t`ENABLE NOTIFICATIONS`,
        action: onDismiss,
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
