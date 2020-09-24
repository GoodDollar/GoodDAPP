// @flow

import { parsePhoneNumberFromString } from 'libphonenumber-js'

const ARGENTINA_COUNTRY_CODE = 'AR'

export const enhanceArgentinaCountryCode = (mobile: string = '') => {
  const parsedPhone = parsePhoneNumberFromString(mobile) || {}
  const { country, countryCallingCode, nationalNumber } = parsedPhone

  if (country === ARGENTINA_COUNTRY_CODE && nationalNumber[0] !== '9') {
    return `+${countryCallingCode}9${nationalNumber}`
  }

  return mobile
}
