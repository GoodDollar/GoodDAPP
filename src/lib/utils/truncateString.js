/*
 * Truncating received string with 3 dots in a middle
 * e.g. truncateStringInMiddle('Hello world', 3) -> 'hel...rld'
 *
 * @param {string} str - string to be shortened
 * @param {number} numberOfCharAround - number of characters to be visible by left and right side
 *
 * @return string
 */
export const truncateStringInMiddle = (str, numberOfCharAround) => {
  return `${str.slice(0, numberOfCharAround)}...${str.slice(-numberOfCharAround)}`
}
