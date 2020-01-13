import { Dimensions } from 'react-native'
import { isBrowser, isMobileOnly } from 'mobile-device-detect'
import { theme } from '../../components/theme/styles'

let originalScreenHeight = 0

if (!originalScreenHeight) {
  originalScreenHeight = Dimensions.get('window').height
}

export const getOriginalScreenHeight = () => originalScreenHeight

export const getScreenHeight = () => Dimensions.get('window').height
export const getMaxDeviceHeight = () => (isMobileOnly ? getScreenHeight() : theme.sizes.maxHeightForTabletAndDesktop)

export const getScreenWidth = () => Dimensions.get('window').width

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
