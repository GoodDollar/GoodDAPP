import React from 'react'
import { View } from 'react-native'

// components
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// assets
import ClipboardPermissionSVG from '../../../assets/ClipboardPermission.svg'

const ImageComponent = ({ style }) => (
  <View style={style}>
    <ClipboardPermissionSVG />
  </View>
)

export default ({ onDismiss }) => (
  <ExplanationDialog
    title="Please allow access to your clipboard"
    text={`In order to paste inside the wallet`}
    image={ImageComponent}
    imageHeight={105}
    buttons={[
      {
        action: onDismiss,
      },
    ]}
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
