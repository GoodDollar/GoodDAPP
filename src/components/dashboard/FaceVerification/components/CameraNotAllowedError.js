import React, { useCallback, useEffect } from 'react'

import illustration from '../../../../assets/FRCameraPrmissionError.svg'
import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

import { useDialog } from '../../../../lib/undux/utils/dialog'

const CameraNotAllowedError = ({ onRetry }) => {
  const [showDialog] = useDialog()

  const onDismiss = useCallback(
    dismiss => {
      dismiss()
      onRetry()
    },
    [onRetry]
  )

  useEffect(() => {
    showDialog({
      content: (
        <ExplanationDialog
          errorMessage="We can’t access you camera..."
          title="Please enable camera permission"
          text="Change it via your device settings"
          imageSource={illustration}
        />
      ),
      type: 'error',
      isMinHeight: false,
      buttons: [
        {
          text: 'OK',
          onPress: onDismiss,
        },
      ],
    })
  }, [])

  return null
}

export default CameraNotAllowedError
