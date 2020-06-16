import React from 'react'
import { Image, Platform } from 'react-native'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/ClipboardPermission.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default () => (
  <ExplanationDialog
    title="Please allow access to your clipboard"
    text={`In order to paste inside the wallet`}
    imageSource={illustration}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <ClipboardPermissionDialog />,
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
