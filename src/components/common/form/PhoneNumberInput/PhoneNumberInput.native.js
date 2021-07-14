//@flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-native-phone-input'

type Props = {
  value: string,
  onChange: Function,
  style: Object,
  disableBorder: Boolean,
  textStyle: Object,
  autoFocus: Boolean,
}

export default ({
  onChange,
  value,
  textStyle,
  style,
  onBlur,
  onFocus,
  autoFocus,
  placeholder,
  onSubmitEditing,
  enablesReturnKeyAutomatically,
}: Props) => {
  const phoneInputRef = useRef()
  const countriesMap = useRef(new Map())
  const [isUserTypingCountry, setUserTypingCountry] = useState(false)

  useEffect(() => {
    const countries = phoneInputRef.current.getAllCountries()
    countries.forEach(({ dialCode, iso2 }) => countriesMap.current.set(dialCode, iso2))

    if (autoFocus) {
      phoneInputRef.current.focus()
    }
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

  const onChangeHandler = useCallback(
    (number: string) => {
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

      // need to check phone number for empty value (exclude country code) to save value
      const isEmptyPhone = (completeNumber && completeNumber.trim() === `+${countryCode}`) || !completeNumber

      // need to pass undefined value to properly save empty phone number like in web
      onChange(isEmptyPhone ? undefined : completeNumber)
    },
    [onChange],
  )

  let countryCode = ''
  let phoneNumber = value

  if (phoneInputRef.current) {
    countryCode = `+${phoneInputRef.current.getCountryCode()}`
  }

  if (!isUserTypingCountry && value) {
    phoneNumber = value.toString().replace(countryCode, '')
  }

  const handleSelectCountry = useCallback(() => {
    onChange('')
    setUserTypingCountry(false)
  })

  const textProps = { onBlur, onFocus, placeholder, onSubmitEditing, enablesReturnKeyAutomatically }

  return (
    <PhoneInput
      ref={phoneInputRef}
      value={phoneNumber}
      onChangePhoneNumber={onChangeHandler}
      onSelectCountry={handleSelectCountry}
      style={style}
      textStyle={textStyle}
      textProps={textProps}
    />
  )
}
