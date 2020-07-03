import React, { useCallback, useEffect } from 'react'

import { CustomButton } from '../../../common'
import VerifyError from '../components/VerifyError'

import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'FaceVerificationError' })

const ErrorScreen = ({ styles, screenProps }) => {
  const { screenState } = screenProps
  const { isValid, error: exception, allowRetry = true } = screenState
  const { name, error, message } = exception

  const isCameraNotAllowed = name === 'NotAllowedError'
  const isRelevantError = isCameraNotAllowed || (error || message) === 'Permission denied'

  useEffect(() => {
    if (isValid) {
      screenProps.pop({ isValid })
    }
  }, [isValid])

  const retry = useCallback(() => {
    screenProps.navigateTo('FaceVerification', { showHelper: true })
  }, [screenProps])

  return (
    <VerifyError
      log={log}
      reason={exception}
      action={allowRetry && <CustomButton onPress={retry}>PLEASE TRY AGAIN</CustomButton>}
      title={isRelevantError ? 'Something went wrong...' : 'Something went wrong on our side...'}
      description={
        isRelevantError
          ? isCameraNotAllowed
            ? `Looks like GoodDollar doesn't have access to your camera. Please provide access and try again`
            : null
          : `You see, it's not that easy\n to capture your beauty :)\nSo, let's give it another shot...`
      }
    />
  )
}

ErrorScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default ErrorScreen
