import React from 'react'
import illustration from '../../../../assets/FRClipboardPremissionError.svg'
import Base from './PermissionDialogBase'

const ClipboardPermissionsDialog = ({ styles }) => (
  <Base
    title="Please enable clipboard permission"
    text="Change it via your device settings"
    imageSource={illustration}
  />
)

export default ClipboardPermissionsDialog

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <ClipboardPermissionsDialog />,
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
