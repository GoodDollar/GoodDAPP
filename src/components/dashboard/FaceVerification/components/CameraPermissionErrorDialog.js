import React from 'react'
import illustration from '../../../../assets/FRCameraPrmissionError.svg'
import Base from './PermissionDialogBase'

const CameraPermissionsDialog = ({ styles }) => (
  <Base
    errorMessage="We can’t access you camera..."
    title="Please enable camera permission"
    text="Change it via your device settings"
    imageSource={illustration}
  />
)

export default CameraPermissionsDialog

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <CameraPermissionsDialog />,
  type: 'error',
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
