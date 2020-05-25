import React from 'react'
import addAppIllustration from '../../../../assets/addApp.svg'
import Base from './PermissionDialogBase'

const CameraPermissionsDialog = ({ styles }) => (
  <Base
    title="Please allow access to your camera"
    text="In order to complete the verification"
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
