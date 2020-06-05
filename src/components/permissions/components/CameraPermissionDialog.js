import React from 'react'

import Illustration from '../../../assets/CameraPermission.svg'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

export default () => (
  <ExplanationDialog
    title="Please allow access to your camera"
    text={`In order to complete the verification`}
    image={Illustration}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <CameraPermissionDialog />,
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
