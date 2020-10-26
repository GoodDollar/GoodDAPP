import React from 'react'
import PhoneNumberInput from '../../common/form/PhoneNumberInput/PhoneNumberInput'

export default ({ textStyle, ...props }) => {
  return <PhoneNumberInput {...props} textStyle={{ borderBottomWidth: 1, ...textStyle }} />
}
