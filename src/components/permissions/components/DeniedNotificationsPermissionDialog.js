// libraries
import React from 'react'

// components
import { t } from '@lingui/macro'
import DeniedPermissionDialog from './DeniedPermissionDialog'

// TODO: add image, change texts
export default props => (
  <DeniedPermissionDialog
    errorMessage={t`We can't send You notifications...`}
    title={t`Go to your device settings & enable notifications`}
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
