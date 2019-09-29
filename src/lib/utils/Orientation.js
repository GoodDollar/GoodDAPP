import { Dimensions } from 'react-native'
import { isBrowser } from 'mobile-device-detect'

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
