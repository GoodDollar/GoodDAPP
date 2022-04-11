import React from 'react'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/ClipboardPermission.svg'

export default ({ onDismiss }) => (
  <ExplanationDialog
    title="Please allow access to your clipboard"
    text={`In order to paste inside the wallet`}
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

const { showDialog } = useDialog()

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
