// @flow
// @TODO better UI
import React, { useCallback, useRef } from 'react'
import PhoneInput from 'react-native-phone-input'
import { StyleSheet } from 'react-native'

type Props = {
  value: string,
  onChange: Function,
}

export default (props: Props) => {
  const ref = useRef()
  const onChange = useCallback((number: string) => {
    const countryCode = ref.current.getCountryCode()
    const completeNumber = `+${countryCode}${number}`
    props.onChange(completeNumber)
  })

  let countryCode = ''

  if (ref.current) {
    countryCode = `+${ref.current.getCountryCode()}`
  }

  const phoneNumber = ref.current ?
    props.value.replace(countryCode, '') : props.value

  return (
    <PhoneInput
      ref={ref}
      value={phoneNumber}
      onChangePhoneNumber={onChange}
      textStyle={styles.textStyle}
    />
  )
}

const styles = StyleSheet.create({
  textStyle: {
    borderBottomWidth: 1
  },
})
