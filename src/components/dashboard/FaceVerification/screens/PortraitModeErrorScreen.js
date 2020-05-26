import React from 'react'
import { Image, Platform } from 'react-native'
import { noop } from 'lodash'
import { CustomButton } from '../../../common'
import ErrorBase from '../components/ErrorBaseWithImage'
import logger from '../../../../lib/logger/pino-logger'
import illustration from '../../../../assets/FRPortraitModeError.svg'

const log = logger.child({ from: 'FaceVerificationError' })

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const ErrorScreen = ({ styles, screenProps }) => {
  const { screenState } = screenProps
  const { allowRetry = true } = screenState

  const retry = noop

  return (
    <ErrorBase
      log={log}
      action={allowRetry && <CustomButton onPress={retry}>PLEASE TRY AGAIN</CustomButton>}
      imageSource={illustration}
      title={'please turn your camera\nto portrait mode'}
      description={`It’s a nice landscape,\nbut we need to see\nyour face only in portrait mode`}
    />
  )
}

ErrorScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default ErrorScreen
