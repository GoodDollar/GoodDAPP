// libraries
import React, { useCallback, useEffect } from 'react'

// components
import ExplanationDialog from '../../../common/dialogs/ExplanationDialog'

// hooks
import { useDialog } from '../../../../lib/undux/utils/dialog'

// utils
import { fireEvent, FV_CANTACCESSCAMERA } from '../../../../lib/analytics/analytics'

// assets
import illustration from '../../../../assets/CameraPermissionError.svg'

const CameraNotAllowedError = ({ onRetry, exception = {} }) => {
  const { code } = exception
  const isExistsError = code && code.includes('CameraDoesNotExist')
  const [showDialog] = useDialog()

  const onDismiss = useCallback(() => {
    onRetry()
  }, [onRetry])

  // const showGuide = useCallback(
  //   dismiss => {
  //     // dismiss()
  //     onRetry()
  //   },
  //   [onRetry],
  // )

  useEffect(() => {
    showDialog({
      content: (
        <ExplanationDialog
          errorMessage={isExistsError ? "We can't find your camera.." : 'We can’t access your camera...'}
          title={
            isExistsError ? `Please connect yours\nor\ntry a  different device` : 'Please enable camera permission'
          }
          text={isExistsError ? null : 'Change it via your device settings'}
          imageSource={illustration}
          onDismiss={onDismiss}
          buttons={
            isExistsError ? [] : []

            // : [
            //     {
            //       text: 'How to do that?',
            //       action: showGuide,
            //       mode: 'text',
            //     },
            //   ]
          }
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
