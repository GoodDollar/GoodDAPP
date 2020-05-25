import React from 'react'
import { Image, Platform, StyleSheet, View } from 'react-native'
import { noop } from 'lodash'

import { CustomButton } from '../../../common'
import VerifyError from '../components/VerifyError'

import logger from '../../../../lib/logger/pino-logger'

import Oops from '../../../../assets/oops.svg'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

const log = logger.child({ from: 'FaceVerificationError' })

const styles = StyleSheet.create({
  actionsSpace: {
    marginBottom: getDesignRelativeHeight(16),
  },
})

if (Platform.OS === 'web') {
  Image.prefetch(Oops)
}

const ErrorScreen = ({ screenProps }) => {
  const { screenState } = screenProps
  const { allowRetry = true } = screenState

  const handler = noop // define whatever you need

  return (
    <VerifyError
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
    />
  )
}

ErrorScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default ErrorScreen
