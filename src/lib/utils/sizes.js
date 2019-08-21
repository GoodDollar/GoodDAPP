import { getScreenHeight, getScreenWidth, isPortrait } from './Orientation'

/**
 * Receives a size matching the designs baseSize and converts to dp on the current device
 * @param {number} width
 * @param {boolean} isMax
 * @param {number} baseSize device size on designs
 * @param {number} currentSize device size on current device
 */
const getDesignRelativeSize = (size, isMax = true, baseSize, currentSize) => {
  const sizeInVW = size / baseSize
  const relativeSize = currentSize * sizeInVW
  const calculatedSize = isMax ? Math.min(size, relativeSize) : relativeSize
  return calculatedSize
}

const DESIGN_WIDTH = 360

/**
 * Receives a width matching the designs width and converts to dp on the current device
 * @param {number} width
 * @param {boolean} isMax: should or shouldnt use Math.min
 */
export const getDesignRelativeWidth = (width, isMax = true) => {
  const screenWidth = isPortrait() ? getScreenWidth() : getScreenHeight()
  return getDesignRelativeSize(width, isMax, DESIGN_WIDTH, screenWidth)
}

const DESIGN_HEIGHT = 640 - 24

/**
 * Receives a height matching the designs height and converts to dp on the current device
 * @param {number} height
 * @param {boolean} isMax: should or shouldnt use Math.min
 */
export const getDesignRelativeHeight = (height, isMax = true) => {
  const screenHeight = isPortrait() ? getScreenHeight() : getScreenWidth()
  return getDesignRelativeSize(height, isMax, DESIGN_HEIGHT, screenHeight)
}
