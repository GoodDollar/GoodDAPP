// @flow
import { isBrowser, isTablet } from '../utils/platform'

import { getScreenHeight, getScreenWidth } from './orientation'

const height = getScreenHeight()
const width = getScreenWidth()

const DESIGN_WIDTH = 360
const DESIGN_HEIGHT = 640 - 24

const MAX_WIDTH = 475
const MAX_HEIGHT = 788 // without topbar which is 56

const isDesktopOrTablet = isBrowser || isTablet

const windowHeight = isDesktopOrTablet && height > MAX_HEIGHT ? MAX_HEIGHT : height
const windowWidth = isDesktopOrTablet && width > MAX_WIDTH ? MAX_WIDTH : width

const RESOLUTIONS_PROPORTION = Math.sqrt(
  (windowHeight * windowHeight + windowWidth * windowWidth) /
    (DESIGN_HEIGHT * DESIGN_HEIGHT + DESIGN_WIDTH * DESIGN_WIDTH),
)

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

export const normalizeByLength = (text, fontBaseSize, decreaseThreshold, decreaseRate = 2, minFontSize = 2) => {
  const characterAmount = text.toString().length

  return characterAmount > decreaseThreshold
    ? Math.max(fontBaseSize - decreaseRate * (characterAmount - decreaseThreshold), minFontSize)
    : fontBaseSize
}

const normalizeText = size => {
  let normalizedSize = size

  if (RESOLUTIONS_PROPORTION < 1 && size > 16) {
    normalizedSize *= RESOLUTIONS_PROPORTION
  }

  return normalizedSize
}

export default normalizeText
