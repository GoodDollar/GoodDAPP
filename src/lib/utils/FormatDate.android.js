import moment from 'moment'
import 'moment/min/locales'

import { locale } from './i18n.js'

const shortDateTimeFormat = (() => {
  // do not change locale globally just for particular instance
  const now = moment().locale(locale)
  const localeData = moment.localeData()
  // detect date format
  const dateFormat = localeData.longDateFormat('L')
  
  return `${dateFormat} HH:mm`
})()

export const getFormattedDateTime = (stringDate: string = null) => 
  moment(...filter([stringDate]).format(shortDateTimeFormat)
