import React from 'react'
import { View } from 'react-native'

import ExplanationDialog from '../common/dialogs/ExplanationDialog'
import QRCamerraPermissionSVG from '../../assets/QRCamerraPermission.svg'

const ImageComponent = ({ style }) => (
  <View style={style}>
    <QRCamerraPermissionSVG />
  </View>
)

export default () => (
  <ExplanationDialog
    title="Please allow access to your camera"
    text={`In order to complete the QR code scan`}
    image={ImageComponent}
    imageHeight={96}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <CameraPermissionDialogTypeQR />,
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
