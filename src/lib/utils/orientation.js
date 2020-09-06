import { Dimensions } from 'react-native'
import { isBrowser } from 'mobile-device-detect'

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
