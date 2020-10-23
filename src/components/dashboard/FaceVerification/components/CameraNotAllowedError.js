// libraries
import React, { useEffect } from 'react'

// components
import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

// hooks
import { useDialog } from '../../../../lib/undux/utils/dialog'

// utils
import { ZoomSessionStatus } from '../sdk/ZoomSDK'
import { fireEvent, FV_CANTACCESSCAMERA } from '../../../../lib/analytics/analytics'

// assets
import illustration from '../../../../assets/CameraPermissionError.svg'

const CameraNotAllowedError = ({ onRetry, exception = {} }) => {
  const cameraDoesNotExist = exception.code === ZoomSessionStatus.CameraDoesNotExist
  const [showDialog] = useDialog()

  useEffect(() => {
    showDialog({
      content: (
        <ExplanationDialog
          errorMessage={cameraDoesNotExist ? "We can't find your camera.." : 'We can’t access your camera...'}
          title={
            cameraDoesNotExist ? `Please connect yours\nor\ntry a different device` : 'Please enable camera permission'
          }
          text={cameraDoesNotExist ? null : 'Change it via your device settings'}
          imageSource={illustration}
          buttons={[]}
        />
      ),
      type: 'error',
      isMinHeight: false,
      showButtons: false,
      onDismiss: onRetry,
    })

    fireEvent(FV_CANTACCESSCAMERA)
  }, [])

  return null
}

export default CameraNotAllowedError
