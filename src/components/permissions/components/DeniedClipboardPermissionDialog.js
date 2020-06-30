// libraries
import React from 'react'
import { Image, Platform } from 'react-native'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/ClipboardPermissionError.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const DeniedClipboardPermissionDialog = ({ bottomLinkAction }) => (
  <ExplanationDialog
    title="Go to your device settings & enable clipboard permission"
    imageSource={illustration}
    bottomLink={{
      text: 'How to do that?',
      action: bottomLinkAction,
    }}
  />
)

DeniedClipboardPermissionDialog.hideDissmissButton = true

export default DeniedClipboardPermissionDialog

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
