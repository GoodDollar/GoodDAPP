// @flow

/**
 * format date util function
 * @param {string} stringDate
 */
export const getFormattedDateTime = (stringDate: string) =>
  new Date(stringDate)
    .toLocaleString([], {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    .replace(',', '')
