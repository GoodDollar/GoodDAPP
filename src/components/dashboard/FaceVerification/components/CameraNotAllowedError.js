// libraries
import React, { useCallback, useEffect } from 'react'
import { View } from 'react-native'

// components
import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

// hooks
import { useDialog } from '../../../../lib/undux/utils/dialog'

// utils
import { fireEvent, FV_CANTACCESSCAMERA } from '../../../../lib/analytics/analytics'

// assets
import CameraPermissionErrorSVG from '../../../../assets/CameraPermissionError.svg'

const ImageComponent = ({ style }) => (
  <View style={style}>
    <CameraPermissionErrorSVG />
  </View>
)

const CameraNotAllowedError = ({ onRetry }) => {
  const [showDialog] = useDialog()

  const onDismiss = useCallback(
    dismiss => {
      dismiss()
      onRetry()
    },
    [onRetry],
  )

  useEffect(() => {
    showDialog({
      content: (
        <ExplanationDialog
          errorMessage="We can’t access your camera..."
          title="Please enable camera permission"
          text="Change it via your device settings"
          image={ImageComponent}
          imageHeight={87}
          buttons={[
            {
              text: 'How to do that?',
              action: onDismiss,
              mode: 'text',
            },
          ]}
        />
      ),
      type: 'error',
      isMinHeight: false,
      showButtons: false,
    })

    fireEvent(FV_CANTACCESSCAMERA)
  }, [])

  return null
}

export default CameraNotAllowedError
