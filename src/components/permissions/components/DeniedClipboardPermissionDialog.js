import React from 'react'
import { Image, Platform } from 'react-native'

import { isMobile } from '../../../lib/utils/platform'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import illustration from '../../../assets/ClipboardPermissionError.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default () => (
  <ExplanationDialog
    title="Please enable clipboard permission"
    text={`Change it via your ${isMobile ? 'device' : 'browser'} settings`}
    imageSource={illustration}
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
