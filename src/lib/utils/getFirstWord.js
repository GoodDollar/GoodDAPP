// @flow

/**
 * Returns the first word in a sentence without leading spaces
 * @param {string} sentence
 * @returns {string}
 */
export const getFirstWord = (sentence: string) => {
  const firstWord = /^([\w\u00C0-\u00ff])*/.exec(sentence.trim()) || []
  return typeof sentence === 'string' ? firstWord[0] || '' : ''
}
