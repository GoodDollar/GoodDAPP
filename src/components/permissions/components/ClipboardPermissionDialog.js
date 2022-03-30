import React from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/ClipboardPermission.svg'

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={t`Please allow access to your clipboard`}
    text={t`In order to paste inside the wallet`}
    image={illustration}
    buttons={[
      {
        action: onDismiss,
      },
    ]}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <ClipboardPermissionDialog />,
  isMinHeight: false,
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
