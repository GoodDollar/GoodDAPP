// libraries
import React from 'react'
import { View } from 'react-native'

// components
import CameraPermissionErrorSVG from '../../../assets/CameraPermissionError.svg'
import DeniedPermissionDialog from './DeniedPermissionDialog'

const ImageComponent = ({ style }) => (
  <View style={style}>
    <CameraPermissionErrorSVG />
  </View>
)

export default props => (
  <DeniedPermissionDialog
    errorMessage={"We can't access your camera..."}
    title="Go to your device settings & enable camera permission"
    image={ImageComponent}
    imageHeight={87}
    {...props}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <DeniedCameraPermissionDialog />,
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
