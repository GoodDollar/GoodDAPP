import React from 'react'
import illustration from '../../../../assets/FRAllowCameraPermissions.svg'
import Base from './PermissionDialogBase'

const CameraPermissionsDialog = ({ styles }) => (
  <Base
    title="Please allow access to your camera"
    text="In order to complete the verification"
    imageSource={illustration}
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
