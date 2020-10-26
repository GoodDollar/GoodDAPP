import { useEffect, useState } from 'react'
import config from '../../config/config'
import API from '../../lib/API/api'

export const getCountryFlagUrl = countryCode => {
  return `${config.flagsUrl}${countryCode}.svg`.toLowerCase()
}

export const getCountryCodeForFlag = country => {
  switch (country) {
    // eslint-disable-next-line lines-around-comment
    // "Ascension Island".
    // The flag is missing for it:
    // https://lipis.github.io/flag-icon-css/flags/4x3/ac.svg
    // GitHub issue:
    // https://github.com/lipis/flag-icon-css/issues/537
    // Using "SH" flag as a temporary substitute
    // because previously "AC" and "TA" were parts of "SH".
    case 'AC':
      return 'SH'

    // "Tristan da Cunha".
    // The flag is missing for it:
    // https://lipis.github.io/flag-icon-css/flags/4x3/ta.svg
    // GitHub issue:
    // https://github.com/lipis/flag-icon-css/issues/537
    // Using "SH" flag as a temporary substitute
    // because previously "AC" and "TA" were parts of "SH".
    case 'TA':
      return 'SH'

    default:
      return country
  }
}

export default countryCode => {
  if (countryCode === undefined) {
    return
  }

  const code = getCountryCodeForFlag(countryCode)

  return getCountryFlagUrl(code)
}

let countryCodeResult
export const useCountryCode = () => {
  const [countryCode, setCountryCode] = useState()
  useEffect(() => {
    const check = async () => {
      try {
        if (!countryCodeResult) {
          const { data } = await API.getLocation()
          if (data && data.country) {
            countryCodeResult = data
          }
        }

        setCountryCode(countryCodeResult.country)
      } catch (e) {
        countryCodeResult = undefined
      }
    }
    check()
  }, [])

  return countryCode
}
