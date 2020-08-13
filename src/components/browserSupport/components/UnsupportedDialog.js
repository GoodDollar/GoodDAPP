// libraries
import React from 'react'
import { Image, Platform } from 'react-native'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={"Oops! This browser isn't supported"}
    text={'Please switch to Chrome or Safari'}
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
  content: <UnsupportedDialog />,
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
