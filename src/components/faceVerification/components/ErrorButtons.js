import React from 'react'
import { View } from 'react-native'

import GiveUpButton from '../standalone/components/GiveUpButton'
import { CustomButton } from '../../common'
import useVerificationAttempts from '../hooks/useVerificationAttempts'

const ErrorButtons = ({ styles, screenProps, navigation, onRetry }) => {
  const { isReachedMaxAttempts } = useVerificationAttempts()
  const reachedMax = isReachedMaxAttempts()

  return (
    <View style={{ width: '100%' }}>
      {!reachedMax && <CustomButton onPress={onRetry}>TRY AGAIN</CustomButton>}
      <GiveUpButton navigation={navigation} />
    </View>
  )
}

export default ErrorButtons
