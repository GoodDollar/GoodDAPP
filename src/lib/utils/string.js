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

  const firstHalf = string.slice(0, maxLength)
  const lastHalf = string.slice(-maxLength)

  return firstHalf + ellipsis + lastHalf
}
