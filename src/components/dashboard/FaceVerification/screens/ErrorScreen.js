import React, { useCallback, useEffect } from 'react'
import { CustomButton } from '../../../common'
import ErrorBase from '../components/ErrorBaseWithImage'
import logger from '../../../../lib/logger/pino-logger'

const log = logger.child({ from: 'FaceVerificationError' })

const ErrorScreen = ({ styles, screenProps }) => {
  const { screenState } = screenProps
  const { isValid, error: exception, allowRetry = true } = screenState

  useEffect(() => {
    if (isValid) {
      screenProps.pop({ isValid })
    }
  }, [isValid])

  const retry = useCallback(() => {
    screenProps.navigateTo('FaceVerification', { showHelper: true })
  }, [screenProps])

  return (
    <ErrorBase
      log={log}
      reason={exception}
      action={allowRetry && <CustomButton onPress={retry}>PLEASE TRY AGAIN</CustomButton>}
      title={'Something went wrong\non our side...'}
      description={`You see, it's not that easy\n to capture your beauty :)\nSo, let's give it another shot...`}
    />
  )
}

ErrorScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default ErrorScreen
