/*
 * Truncating received string in a middle
 *
 * @param {string} string - string to be shortened
 * @param {number} maxLength - maximum length of the truncated string
 * @param {string} ellipsis - ellipsis string. Three dots by default
 *
 * @return string
 */

export const truncateMiddle = (string, maxLength = null, ellipsis = '...') => {
  if (!maxLength) {
    return string
  }

  const halfLength = Math.floor((maxLength - ellipsis.length) / 2)
  const firstHalf = string.slice(0, halfLength)
  const lastHalf = string.slice(-halfLength)

  return firstHalf + ellipsis + lastHalf
}
