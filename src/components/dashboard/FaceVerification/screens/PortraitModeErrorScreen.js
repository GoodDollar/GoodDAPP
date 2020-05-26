import React from 'react'
import { Image, Platform } from 'react-native'
import { noop } from 'lodash'
import { CustomButton } from '../../../common'
import VerifyError from '../components/VerifyError'
import logger from '../../../../lib/logger/pino-logger'
import Oops from '../../../../assets/oops.svg'
import FRPortraitModeError from '../../../../assets/FRPortraitModeError.svg'

const log = logger.child({ from: 'FaceVerificationError' })

if (Platform.OS === 'web') {
  Image.prefetch(Oops)
}

const ErrorScreen = ({ styles, screenProps }) => {
  const { screenState } = screenProps
  const { allowRetry = true } = screenState

  const retry = noop

  return (
    <VerifyError
      log={log}
      action={allowRetry && <CustomButton onPress={retry}>PLEASE TRY AGAIN</CustomButton>}
      imageSource={FRPortraitModeError}
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
