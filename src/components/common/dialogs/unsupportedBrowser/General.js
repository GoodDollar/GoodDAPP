// libraries
import React from 'react'
import { Image, Platform } from 'react-native'

// components
import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../../assets/UnsuportedBrowser.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={'For best user\nexperience switch to\nChrome or Safari browsers'}
    imageSource={illustration}
    imageHeight={124}
    buttons={[
      {
        text: 'GOT IT',
        action: onDismiss,
      },
    ]}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <GeneralUnsupportedBrowserDialog />,
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
