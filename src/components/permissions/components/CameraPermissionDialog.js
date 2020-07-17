import React from 'react'
import { View } from 'react-native'

import ExplanationDialog from '../../common/dialogs/ExplanationDialog'
import CameraPermissionSVG from '../../../assets/CameraPermission.svg'

const ImageComponent = ({ style }) => (
  <View style={style}>
    <CameraPermissionSVG />
  </View>
)

export default ({ onDismiss }) => (
  <ExplanationDialog
    title={'You must allow access\nto your camera'}
    text="In order to claim G$'s"
    image={ImageComponent}
    imageHeight={128}
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
