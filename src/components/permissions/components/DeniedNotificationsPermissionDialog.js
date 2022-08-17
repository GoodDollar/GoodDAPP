// libraries
import React, { useCallback } from 'react'

// components
import { t } from '@lingui/macro'
import { Linking } from 'react-native'
import illustration from '../../../assets/NotificationPermissionError.svg'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

export default ({ onDismiss, hideDialog, ...props }) => {
  const openSettings = useCallback(() => {
    onDismiss()
    Linking.openSettings()
  }, [onDismiss])

  return (
    <ExplanationDialog
      title={t`Oops! You need to enable notifications on your phone.`}
      image={illustration}
      buttonsContainerStyle={{
        flexDirection: 'column',
      }}
      buttons={[
        {
          text: t`GO TO SETTINGS`,
          action: openSettings,
          style: { width: '100%', marginBottom: 8 },
          hideDialog,
        },
        {
          text: t`MAYBE LATER`,
          action: onDismiss,
          mode: 'text',
          hideDialog,
        },
      ]}
      {...props}
    />
  )
}

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
