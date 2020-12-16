// @flow
import { values as _values, isNumber, isString, remove } from 'lodash'
import { ANALYTICS_EVENT } from './constants'

export const convertToGoogleAnalytics = (event: string, data: any = {}) => {
  const all = _values(data)
  const values = remove(all, isNumber)
  const strings = remove(all, isString)

  const eventData = {
    eventAction: event,
    eventValue: values.shift(),
    eventLabel: strings.shift() || values.shift() || JSON.stringify(all.shift()),
  }

  return { eventName: ANALYTICS_EVENT, eventData }
}
