import { Dimensions } from 'react-native'

export const getScreenHeight = () => Dimensions.get('screen').height

export const getScreenWidth = () => Dimensions.get('screen').width

export const isPortrait = () => getScreenHeight() >= getScreenWidth()

/**
 * Event listener for orientation changes
 * @param {Function} callback
 */
const listenOrientationChange = callback => {
  Dimensions.addEventListener('change', () => {
    callback({
      portrait: isPortrait(),
      height: getScreenHeight(),
      width: getScreenWidth()
    })
  })
}

export default listenOrientationChange
