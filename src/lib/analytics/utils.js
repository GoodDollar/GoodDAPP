// @flow
import { isNumber, isString, remove, values } from 'lodash'

export const convertToGoogleAnalytics = (data: any = {}) => {
  const dataValues = values(data)
  const eventValues = remove(dataValues, isNumber)
  const eventStrings = remove(dataValues, isString)

  return {
    eventAction: 'event',
    eventValue: eventValues.shift(),
    eventLabel: eventStrings.shift() || eventValues.shift() || JSON.stringify(dataValues.shift()),
  }
}
