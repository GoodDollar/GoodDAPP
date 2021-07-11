// @flow
import moment from 'moment'

/**
 * format date util function
 * @param {string} stringDate
 */
export const getFormattedDateTime = (stringDate: string = null) => moment(stringDate).format('DD.MM.YY HH:mm')
