import { Platform } from 'react-native'
import { fromPairs, isEmpty, isString, memoize, omitBy, pickBy, trimEnd, trimStart } from 'lodash'

// appId is native only, should be excluded on the web, domains is vice versa
const fieldToExclude = Platform.select({ web: 'appId', default: 'domains' })

// JavaScript SDK accepts JSON literal, will convert license text to it
const formatAsJSON = Platform.select({ web: true, default: false })

export const parseLicense = memoize(licenseText => {
  if (!isString(licenseText) || isEmpty(licenseText)) {
    return null
  }

  let license = licenseText
    .split('\n') // exclude options non-related to the current platform from license text
    .filter(line => !isEmpty(line) && line.includes('=') && !line.includes(fieldToExclude))

  // format license according to the current platform
  license = !formatAsJSON
    ? license.join('\n')
    : fromPairs(
        license.map(line => {
          const [option, value = ''] = line.split('=')

          return [trimEnd(option), trimStart(value)]
        }),
      )

  if (isEmpty(license)) {
    return null
  }

  return license
})

export const parseVerificationOptions = sessionOptions => {
  const eventMatcher = (_, option) => option.startsWith('on')
  const options = sessionOptions || {}

  return {
    eventCallbacks: pickBy(options, eventMatcher),
    options: omitBy(options, eventMatcher),
  }
}
