import React from 'react'

import { isMobile } from '../../../lib/utils/platform'

import Illustration from '../../../assets/CameraPermissionError.svg'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

export default () => (
  <ExplanationDialog
    errorMessage={"We can't access your camera..."}
    title="Please enable camera permission"
    text={`Change it via your ${isMobile ? 'device' : 'browser'} settings`}
    image={Illustration}
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
