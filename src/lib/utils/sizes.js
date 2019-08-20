import { getScreenHeight, getScreenWidth, isPortrait } from './Orientation'

const DESIGN_WIDTH = 360

/**
 * Receives a width matching the designs width and converts to dp on the current device
 * @param {number} width
 */
export const getDesignRelativeSize = width => {
  // Getting relation from designs
  const screenWidth = isPortrait() ? getScreenWidth() : getScreenHeight()

  const sizeInVW = width / DESIGN_WIDTH
  const size = Math.min(width, screenWidth * sizeInVW)
  return size
}
