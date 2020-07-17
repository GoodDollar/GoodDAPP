// libraries
import React from 'react'
import { View } from 'react-native'

// components
import ClipboardPermissionError from '../../../assets/ClipboardPermissionError.svg'
import DeniedPermissionDialog from './DeniedPermissionDialog'

const ImageComponent = ({ style }) => (
  <View style={style}>
    <ClipboardPermissionError />
  </View>
)

export default props => (
  <DeniedPermissionDialog
    title="Go to your device settings & enable clipboard permission"
    imageSource={ImageComponent}
    imageHeight={119}
    {...props}
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
