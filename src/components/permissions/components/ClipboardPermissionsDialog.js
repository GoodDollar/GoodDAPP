import React from 'react'

import { isMobile } from '../../../lib/utils/platform'

import Illustration from '../../../assets/FRAllowCameraPermissions.svg'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

export default () => (
  <ExplanationDialog
    title="Please enable clipboard permissions"
    text={`Change it via your ${isMobile ? 'device' : 'browser'} settings`}
    image={Illustration}
  />
)

/*
 - Usage example

const [showDialog] = useDialog()

showDialog({
  content: <ClipboardPermissionDialog />,
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
