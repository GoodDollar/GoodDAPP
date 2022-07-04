import React from 'react'

import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// TODO: add image, change texts
export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Please allow us sending You notifications`}
    buttons={[
      {
        text: t`OK`,
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
