// libraries
import React from 'react'

// components
import illustration from '../../../assets/ClipboardPermissionError.svg'
import DeniedPermissionDialog from './DeniedPermissionDialog'

export default props => (
  <DeniedPermissionDialog
    title="Go to your device settings & enable clipboard permission"
    image={illustration}
    imageHeight={119}
    {...props}
  />
)

/*
 - Usage example

const { showDialog } = useDialog()

showDialog({
  content: <DeniedClipboardPermissionDialog />,
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
