import React from 'react'
import { Image, Platform } from 'react-native'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/CameraPermission.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={`Enable camera access\nto claim G$'s`}
    imageSource={illustration}
    imageHeight={128}
    buttons={[
      {
        text: 'I UNDERSTAND',
        action: onDismiss,
      },
    ]}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <CameraPermissionDialog />,
  isMinHeight: false,
  showButtons: false,
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
