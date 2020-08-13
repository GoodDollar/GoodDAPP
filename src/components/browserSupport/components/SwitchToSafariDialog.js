// libraries
import React from 'react'
import { Image, Platform } from 'react-native'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// utils
import normalizeText from '../../../lib/utils/normalizeText'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'

// assets
import illustration from '../../../assets/UnsuportedBrowser.svg'

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

export default () => (
  <ExplanationDialog
    title={"Oops! This browser isn't supported"}
    text={'On iOS please switch to Safari'}
    textStyle={{
      fontSize: normalizeText(16),
      marginVertical: getDesignRelativeHeight(25, false),
    }}
    imageSource={illustration}
    imageHeight={124}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <SwitchToSafariDialog />,
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
