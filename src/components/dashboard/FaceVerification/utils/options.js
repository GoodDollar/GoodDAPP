import { omitBy, pickBy } from 'lodash'

export const parseVerificationOptions = sessionOptions => {
  const eventMatcher = (_, option) => option.startsWith('on')
  const options = sessionOptions || {}

  return {
    eventCallbacks: pickBy(options, eventMatcher),
    options: omitBy(options, eventMatcher),
  }
}
