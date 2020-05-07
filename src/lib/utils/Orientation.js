import { Dimensions } from 'react-native'
import { isBrowser } from 'mobile-device-detect'
import { theme } from '../../components/theme/styles'

let originalScreenHeight = 0

if (!originalScreenHeight) {
  originalScreenHeight = Dimensions.get('window').height
}

let originalScreenWidth = 0

if (!originalScreenWidth) {
  originalScreenWidth = Dimensions.get('window').width
}

export const getOriginalScreenHeight = () => originalScreenHeight
export const getOriginalScreenWidth = () => originalScreenWidth

export const getScreenHeight = () => Dimensions.get('window').height
export const getMaxDeviceHeight = () => {
  const height = getScreenHeight()

  if (height > theme.sizes.maxHeightForTabletAndDesktop) {
    return theme.sizes.maxHeightForTabletAndDesktop
  }

  return height
}

export const getScreenWidth = () => Dimensions.get('window').width
export const getMaxDeviceWidth = () => {
  const width = getScreenWidth()
  if (width > theme.sizes.maxWidthForTabletAndDesktop) {
    return theme.sizes.maxWidthForTabletAndDesktop
  }

  return width
}

export const isPortrait = () => {
  return isBrowser ? true : getScreenHeight() >= getScreenWidth()
}

/**
 * Event listener for orientation changes
 * @param {Function} callback
 */
const listenOrientationChange = callback => {
  Dimensions.addEventListener('change', () => {
    callback({
      portrait: isPortrait(),
      height: getScreenHeight(),
      width: getScreenWidth(),
    })
  })
}

export default listenOrientationChange
