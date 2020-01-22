// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-native-phone-input'
import { StyleSheet } from 'react-native'

type Props = {
  value: string,
  onChange: Function,
}

export default (props: Props) => {
  const phoneInputRef = useRef()
  const countriesMap = useRef(new Map())
  const [isUserTypingCountry, setUserTypingCountry] = useState(false)

  useEffect(() => {
    const countries = phoneInputRef.current.getAllCountries()
    countriesMap.current = countries.reduce((acc, curr) => {
      acc.set(curr.dialCode, curr.iso2)
      return acc
    }, new Map())
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
      const isSameCountry = new RegExp(countryCode).test(number)

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
      textStyle={styles.textStyle}
      onSelectCountry={handleSelectCountry}
    />
  )
}

const styles = StyleSheet.create({
  textStyle: {
    borderBottomWidth: 1,
  },
})
