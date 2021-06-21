import { theme } from '../../components/theme/styles'
import { getScreenHeight, getScreenWidth, isPortrait } from './orientation'
import { isMobile } from './platform'

const DESIGN_WIDTH = 360
const DESIGN_HEIGHT = 640 - 24

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

// had to re-defined those utils set as an class instance
// to allow mocking getMaxDeviceWidth/Height.
// otherwise there are used as closures and couldn't be overrided
const sizes = new class {
  // have moved the following two functions here to break the circle dependency
  // components/theme/styles -> lib/utls/normalizeText -> lib/utils/orientation -> components/theme/styles
  getMaxDeviceWidth() {
    const width = getScreenWidth()
    const { maxWidthForTabletAndDesktop } = theme.sizes

    // To ensure it doesn't return values smaller than device width on mobile
    return isMobile ? width : Math.min(width, maxWidthForTabletAndDesktop)
  }

  getMaxDeviceHeight() {
    const height = getScreenHeight()
    const { maxHeightForTabletAndDesktop } = theme.sizes

    // To ensure it doesn't return values smaller than device height on mobile
    return isMobile ? height : Math.min(height, maxHeightForTabletAndDesktop)
  }

  /**
   * Receives a width matching the designs width and converts to dp on the current device
   * @param {number} width
   * @param {boolean} isMax: should or shouldnt use Math.min
   */
  getDesignRelativeWidth(width, isMax = true) {
    const { getMaxDeviceWidth, getMaxDeviceHeight } = sizes
    const screenWidth = isPortrait() ? getMaxDeviceWidth() : getMaxDeviceHeight()

    return getDesignRelativeSize(width, isMax, DESIGN_WIDTH, screenWidth)
  }

  /**
   * Receives a height matching the designs height and converts to dp on the current device
   * @param {number} height
   * @param {boolean} isMax: should or shouldnt use Math.min
   */
  getDesignRelativeHeight(height, isMax = true) {
    const { getMaxDeviceWidth, getMaxDeviceHeight } = sizes
    const screenHeight = isPortrait() ? getMaxDeviceHeight() : getMaxDeviceWidth()

    return getDesignRelativeSize(height, isMax, DESIGN_HEIGHT, screenHeight)
  }

  // eslint-disable-next-line
  async measure(view) {
    return new Promise(resolve => view.measure((x, y, width, height) => resolve({ x, y, width, height })))
  }
}()

// backward compatibility expors
export const { getMaxDeviceWidth, getMaxDeviceHeight, getDesignRelativeWidth, getDesignRelativeHeight, measure } = sizes

const width = getScreenWidth()
const height = getScreenHeight()

export const isSmallDevice = width < 350
export const isMediumDevice = width >= 350 && width < 395
export const isLargeDevice = width >= 395
export const isShortDevice = height < 610
export const isLongDevice = height > 640

export default sizes
