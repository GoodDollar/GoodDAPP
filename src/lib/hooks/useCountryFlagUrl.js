import { useEffect, useState } from 'react'
import { get } from 'lodash'
import config from '../../config/config'
import API, { getErrorMessage } from '../../lib/API'
import logger from '../logger/js-logger'

export const getCountryFlagUrl = countryCode => {
  return `${config.flagsUrl}${countryCode}.svg`.toLowerCase()
}

const log = logger.child({ from: 'useCountryFlagUrl' })

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

let sharedCountryCode

export const useCountryCode = () => {
  const [countryCode, setCountryCode] = useState(sharedCountryCode)

  useEffect(() => {
    if (countryCode) {
      return
    }

    API.getLocation()
      .catch(e => {
        log.warn('GetLocation error ', getErrorMessage(e), e)
      })
      .then(response => {
        const code = get(response, 'country')

        if (code) {
          sharedCountryCode = code
          setCountryCode(code)
        }
      })
  }, [])

  return countryCode
}
