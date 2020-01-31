// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-native-phone-input'
import { StyleSheet } from 'react-native'

type Props = {
  value: string,
  onChange: Function,
  style: Object,
  disableBorder: Boolean,
}

export default (props: Props) => {
  const phoneInputRef = useRef()
  const countriesMap = useRef(new Map())
  const [isUserTypingCountry, setUserTypingCountry] = useState(false)

  useEffect(() => {
    const countries = phoneInputRef.current.getAllCountries()
    countries.forEach(({ dialCode, iso2 }) => countriesMap.current.set(dialCode, iso2))
  }, [])

  const findMatchedCountry = useCallback((number: string) => {
    let foundCountry

    for (let i = 0; i < 4; i++) {
      const possibleCode = number.substring(0, i)

      if (countriesMap.current.has(possibleCode)) {
        foundCountry = countriesMap.current.get(possibleCode)
        break
      }
    }

    return foundCountry
  }, [])

  const onChange = useCallback((number: string) => {
    let countryCode = phoneInputRef.current.getCountryCode()
    const isUserTypingCountryNow = number.startsWith('+')

    if (isUserTypingCountry !== isUserTypingCountryNow) {
      setUserTypingCountry(isUserTypingCountryNow)
    }

    let completeNumber = number

    if (isUserTypingCountryNow) {
      const isSameCountry = number.startsWith(`+${countryCode}`)

      if (!isSameCountry) {
        const countryISO = findMatchedCountry(number)

        if (countryISO) {
          phoneInputRef.current.selectCountry(countryISO)
        }
      }
    } else {
      completeNumber = `+${countryCode}${number}`
    }

    props.onChange(completeNumber)
  })

  let countryCode = ''
  let phoneNumber = props.value

  if (phoneInputRef.current) {
    countryCode = `+${phoneInputRef.current.getCountryCode()}`
  }

  if (!isUserTypingCountry) {
    phoneNumber = props.value.replace(countryCode, '')
  }

  const handleSelectCountry = useCallback(() => {
    props.onChange('')
    setUserTypingCountry(false)
  })

  return (
    <PhoneInput
      ref={phoneInputRef}
      value={phoneNumber}
      onChangePhoneNumber={onChange}
      textStyle={!props.disableBorder && styles.textStyle}
      onSelectCountry={handleSelectCountry}
      style={props.style}
    />
  )
}

const styles = StyleSheet.create({
  textStyle: {
    borderBottomWidth: 1,
  },
})
