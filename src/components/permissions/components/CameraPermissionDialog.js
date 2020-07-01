import React from 'react'
import { Image, Platform } from 'react-native'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/CameraPermission.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={'You must allow access\nto your camera'}
    text="In order to claim G$'s"
    imageSource={illustration}
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
