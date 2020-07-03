// libraries
import React from 'react'
import { Image, Platform } from 'react-native'

// components
import illustration from '../../../assets/CameraPermissionError.svg'
import DeniedPermissionDialog from './DeniedPermissionDialog'

// assets

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default props => (
  <DeniedPermissionDialog
    errorMessage={"We can't access your camera..."}
    title="Go to your device settings & enable camera permission"
    imageSource={illustration}
    {...props}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

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
