// @flow

/**
 * Returns the first word in a sentence without leading spaces
 * @param {string} sentence
 * @returns {string}
 */
export const getFirstWord = (sentence: string) =>
  typeof sentence === 'string' ? /^([\w\u00C0-\u00ff])*/.exec(sentence.trim())[0] || '' : ''
