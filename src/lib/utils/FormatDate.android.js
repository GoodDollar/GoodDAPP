// @flow
import { filter } from 'lodash'
import moment from 'moment'
import 'moment/min/locales'

import { locale } from './i18n.js'

const shortDateTimeFormat = (() => {
  // do not change locale globally just for particular instance
  const now = moment().locale(locale)
  const localeData = now.localeData()

  // detect date format
  const dateFormat = localeData.longDateFormat('L')

  return `${dateFormat} HH:mm`
})()

/**
 * format date util function
 * @param {string} stringDate
 */
export const getFormattedDateTime = (stringDate: string = null) =>
  moment(...filter([stringDate])).format(shortDateTimeFormat)
