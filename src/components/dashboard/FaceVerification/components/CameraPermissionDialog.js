import React from 'react'
import addAppIllustration from '../../../../assets/addApp.svg'
import Base from './PermissionDialogBase'

const CameraPermissionsDialog = ({ styles }) => (
  <Base
    errorMessage="We can’t access you camera..."
    title="Please enable camera permission"
    text="Change it via your device settings"
    imageSource={addAppIllustration}
  />
)

export default CameraPermissionsDialog

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <CameraPermissionsDialog />,
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
