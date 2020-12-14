// @flow
import { isNumber, isString, remove, values } from 'lodash'
import { ANALYTICS_EVENT } from './constants'

export const convertToGoogleAnalytics = (event: string, data: any = {}) => {
  const dataValues = values(data)
  const eventValues = remove(dataValues, isNumber)
  const eventStrings = remove(dataValues, isString)

  return [
    ANALYTICS_EVENT,
    {
      eventAction: event,
      eventValue: eventValues.shift(),
      eventLabel: eventStrings.shift() || eventValues.shift() || JSON.stringify(dataValues.shift()),
    },
  ]
}
