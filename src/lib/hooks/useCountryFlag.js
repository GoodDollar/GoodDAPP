/* eslint import/namespace: ['error', { allowComputed: true }] */
// @flow
import { useMemo } from 'react'
import flags from 'react-phone-number-input/flags'
import ReactDOMServer from 'react-dom/server'

const getCountryFlag = countryCode => {
  const code = countryCode.toUpperCase()
  return flags[code]({})
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

export default countryCode =>
  useMemo(() => {
    if (!countryCode) {
      return
    }

    const code = getCountryCodeForFlag(countryCode)
    const flag = getCountryFlag(code)

    // ref: https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md#serialize
    const svgFlag = flag ? ReactDOMServer.renderToStaticMarkup(flag) : null
    return svgFlag
  }, [countryCode])
