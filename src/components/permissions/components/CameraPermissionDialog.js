import React from 'react'
import { Image, Platform } from 'react-native'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/CameraPermission.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const CameraPermissionDialog = () => (
  <ExplanationDialog
    title={'You must allow access\nto your camera'}
    text="In order to claim G$'s"
    imageSource={illustration}
  />
)

CameraPermissionDialog.dismissButtonText = 'I UNDERSTAND'

export default CameraPermissionDialog

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <CameraPermissionDialog />,
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
