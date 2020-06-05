import React from 'react'
import { Image, Platform } from 'react-native'

import { isMobile } from '../../../lib/utils/platform'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/CameraPermissionError.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default () => (
  <ExplanationDialog
    errorMessage={"We can't access your camera..."}
    title="Please enable camera permission"
    text={`Change it via your ${isMobile ? 'device' : 'browser'} settings`}
    imageSource={illustration}
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
