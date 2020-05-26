import React from 'react'
import { Image, Platform, StyleSheet, View } from 'react-native'
import { noop } from 'lodash'

import { CustomButton } from '../../../common'
import ErrorBase from '../components/ErrorBaseWithImage'

import logger from '../../../../lib/logger/pino-logger'

import illustration from '../../../../assets/FRUnrecoverableError.svg'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

const log = logger.child({ from: 'FaceVerificationError' })

const styles = StyleSheet.create({
  actionsSpace: {
    marginBottom: getDesignRelativeHeight(16),
  },
  imageStyle: {
    height: getDesignRelativeHeight(230, false),
  },
})

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const UnrecoverableErrorScreen = ({ screenProps }) => {
  const { screenState } = screenProps
  const { allowRetry = true } = screenState

  const handler = noop // define whatever you need

  return (
    <ErrorBase
      log={log}
      action={
        allowRetry && (
          <View>
            <CustomButton onPress={handler} style={styles.actionsSpace}>
              OK
            </CustomButton>
            <CustomButton mode="outlined" onPress={handler}>
              CONTACT SUPPORT
            </CustomButton>
          </View>
        )
      }
      titleWithoutUsername
      title={'Sorry about that…\nWe’re looking in to it,\nplease try again later'}
      imageSource={illustration}
      imageStyle={styles.imageStyle}
    />
  )
}

UnrecoverableErrorScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default UnrecoverableErrorScreen
