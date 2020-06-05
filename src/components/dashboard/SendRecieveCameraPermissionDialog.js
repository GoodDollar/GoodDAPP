import React from 'react'
import { Image, Platform } from 'react-native'

import ExplanationDialog from '../common/dialogs/ExplanationDialog'
import illustration from '../../assets/QRCamerraPermission.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default () => (
  <ExplanationDialog
    title="Please allow access to your camera"
    text={`In order to complete the QR code scan`}
    imageSource={illustration}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <CameraPermissionDialogTypeQR />,
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
