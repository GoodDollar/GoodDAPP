// libraries
import React from 'react'

// components
import illustration from '../../../assets/CameraPermissionError.svg'
import DeniedPermissionDialog from './DeniedPermissionDialog'

export default props => (
  <DeniedPermissionDialog
    errorMessage={"We can't access your camera..."}
    title="Go to your device settings & enable camera permission"
    image={illustration}
    {...props}
  />
)

/*
 - Usage example

const { showDialog } = useDialog()

showDialog({
  content: <DeniedCameraPermissionDialog />,
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
