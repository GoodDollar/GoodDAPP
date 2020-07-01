// libraries
import React from 'react'
import { Image, Platform } from 'react-native'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/CameraPermissionError.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const DeniedCameraPermissionDialog = ({ onDismiss, navigate }) => (
  <ExplanationDialog
    errorMessage={"We can't access your camera..."}
    title="Go to your device settings & enable camera permission"
    imageSource={illustration}
    buttons={[
      {
        text: 'How to do that?',
        action: () => {
          onDismiss()
          navigate('Support')
        },
        mode: 'text',
      },
    ]}
  />
)

DeniedCameraPermissionDialog.hideDissmissButton = true

export default DeniedCameraPermissionDialog

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
