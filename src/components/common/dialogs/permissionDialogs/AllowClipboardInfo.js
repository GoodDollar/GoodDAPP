import React from 'react'
import Illustration from '../../../../assets/FRAllowCameraPermissions.svg'
import ExplanationDialog from '../../dialogs/ExplanationDialog'

export default () => (
  <ExplanationDialog
    title="Please allow access to your clipboard"
    text="In order to paste inside the wallet"
    image={Illustration}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <AllowClipboardPermissionInfoDialog />,
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
