import React from 'react'
import PhoneInput from 'react-phone-number-input'
import './PhoneInput.css'
import { View } from 'react-native'

const EditPhoneInput = props => {
  const hasWrapper = props.nativeID ? (
    <View nativeID={props.nativeID}>
      <PhoneInput {...props} />
    </View>
  ) : (
    <PhoneInput {...props} />
  )
  return hasWrapper
}

export default EditPhoneInput
