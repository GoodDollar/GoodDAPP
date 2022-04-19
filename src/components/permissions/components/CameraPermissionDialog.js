import React from 'react'

import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/CameraPermission.svg'

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Enable camera access` + `\n` + t`to claim G$'s`}
    image={illustration}
    imageHeight={128}
    buttons={[
      {
        text: t`I UNDERSTAND`,
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
