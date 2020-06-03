import React from 'react'
import Illustration from '../../../../assets/FRAllowCameraPermissions.svg'
import ExplanationDialog from '../../dialogs/ExplanationDialog'

export default () => (
  <ExplanationDialog
    title="Please enable clipboard permissions"
    text="Change it via your device settings"
    image={Illustration}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <AllowClipboardPermissionErrorDialog />,
  isMinHeight: false,
  type: 'error',
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
