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

/*
 * Decreases font-size of string based on the string lenght
 *
 * @param {string | number} text - the string or number that we want to reduce the size of
 * @param {number} fontBaseSize - the default size of the text
 * @param {number} decreaseThreshold - the character amount where the font starts shrinking
 * @param {number} decreaseRate - how much the fontSize decreases per character
 * @param {number} minFontSize - the minimum size this text can have
 *
 * @return string
 */

export const decreaseFontSizeBasedOnCharacterAmount = (
  text,
  fontBaseSize,
  decreaseThreshold,
  decreaseRate = 2,
  minFontSize = 2,
) => {
  const characterAmount = text.toString().length
  return characterAmount > decreaseThreshold
    ? Math.max(fontBaseSize - decreaseRate * (characterAmount - decreaseThreshold), minFontSize)
    : fontBaseSize
}
