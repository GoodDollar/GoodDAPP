import React from 'react'
import { StyleSheet, View } from 'react-native'
import { noop } from 'lodash'

import { CustomButton } from '../../../common'
import ErrorBase from '../components/ErrorBaseWithAnimation'

import logger from '../../../../lib/logger/pino-logger'

import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

const log = logger.child({ from: 'FaceVerificationError' })

const styles = StyleSheet.create({
  actionsSpace: {
    marginBottom: getDesignRelativeHeight(16),
  },
})

const ErrorScreen = ({ screenProps }) => {
  const { screenState } = screenProps
  const { allowRetry = true } = screenState

  const retry = noop // define whatever you need

  return (
    <ErrorBase
      log={log}
      action={
        allowRetry && (
          <View>
            <CustomButton onPress={retry} mode="outlined" style={styles.actionsSpace}>
              CONTACT SUPPORT
            </CustomButton>
            <CustomButton onPress={retry}>TRY AGAIN</CustomButton>
          </View>
        )
      }
      twoErrorImages
      title={'Unfortunately, We found your twin...'}
      boldDescription={'You can open ONLY ONE account per person.'}
      description={'If this is your only active account - please contact our support'}
    />
  )
}

ErrorScreen.navigationOptions = {
  title: 'Face Verification',
  navigationBarHidden: false,
}

export default ErrorScreen
