import React from 'react'
import Illustration from '../../../../assets/FRAllowCameraPermissions.svg'
import ExplanationDialog from '../../dialogs/ExplanationDialog'

export default () => (
  <ExplanationDialog
    title="Please allow access to your camera"
    text="In order to complete the QR code scan"
    image={Illustration}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <AllowCameraPermissionInfoDialog />,
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
