import React from 'react'
import addAppIllustration from '../../../../assets/addApp.svg'
import Base from './PermissionDialogBase'

const ClipboardPermissionsDialog = ({ styles }) => (
  <Base
    title="Please enable clipboard permission"
    text="Change it via your device settings"
    imageSource={addAppIllustration}
  />
)

export default ClipboardPermissionsDialog

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <ClipboardPermissionsDialog />,
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
