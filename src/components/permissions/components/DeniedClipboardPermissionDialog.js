// libraries
import React from 'react'
import { Image, Platform } from 'react-native'

// components
import illustration from '../../../assets/ClipboardPermissionError.svg'
import DeniedPermissionDialog from './DeniedPermissionDialog'

// assets

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default props => (
  <DeniedPermissionDialog
    title="Go to your device settings & enable clipboard permission"
    imageSource={illustration}
    imageHeight={119}
    {...props}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

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
