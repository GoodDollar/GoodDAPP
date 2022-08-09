// libraries
import React from 'react'

// components
import { t } from '@lingui/macro'
import illustration from '../../../assets/NotificationPermissionError.svg'
import DeniedPermissionDialog from './DeniedPermissionDialog'

// TODO: add image, change texts
export default props => (
  <DeniedPermissionDialog
    title={t`Oops! You need to enable notifications on your phone.`}
    image={illustration}
    {...props}
  />
)

/*
 - Usage example

const { showDialog } = useDialog()

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
