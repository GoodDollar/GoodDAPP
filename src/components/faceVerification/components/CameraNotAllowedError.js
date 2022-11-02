// libraries
import React, { useEffect } from 'react'

// components
import { t } from '@lingui/macro'
import ExplanationDialog from '../../common/dialogs/ExplanationDialog'

// hooks
import { useDialog } from '../../../lib/dialog/useDialog'

// utils
import { FaceTecSessionStatus } from '../sdk/FaceTecSDK'
import { fireEvent, FV_CANTACCESSCAMERA } from '../../../lib/analytics/analytics'

// assets
import illustration from '../../../assets/CameraPermissionError.svg'

const { CameraDoesNotExist } = FaceTecSessionStatus

const CameraNotAllowedError = ({ onRetry, exception }) => {
  const { showDialog } = useDialog()
  const { code } = exception || {}
  const cameraDoesNotExist = code === CameraDoesNotExist

  useEffect(() => {
    const buttons = []
    let errorMessage = t`We can't find your camera..`
    let title = t`Please try a different device`
    let text = null

    if (!cameraDoesNotExist) {
      errorMessage = t`We can't access your camera...`
      title = t`Please enable camera permission`
      text = t`Change it via your device settings`
    }

    if (exception) {
      fireEvent(FV_CANTACCESSCAMERA)
    }

    showDialog({
      content: (
        <ExplanationDialog
          errorMessage={errorMessage}
          title={title}
          text={text}
          image={illustration}
          buttons={buttons}
        />
      ),
      type: 'error',
      isMinHeight: false,
      showButtons: false,
      onDismiss: onRetry,
    })
  }, [])

  return null
}

export default CameraNotAllowedError
