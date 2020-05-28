import React from 'react'
import Illustration from '../../../../assets/FRAllowCameraPermissions.svg'
import ExplanationDialog from '../../dialogs/ExplanationDialog'

const CameraPermissionsDialog = ({ styles }) => (
  <ExplanationDialog
    title="Please allow access to your camera"
    text="In order to scan the QR code"
    image={Illustration}
  />
)

// clipboard permissions dialog also would be in this folder

export default CameraPermissionsDialog

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <CameraPermissionsDialog />,
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
