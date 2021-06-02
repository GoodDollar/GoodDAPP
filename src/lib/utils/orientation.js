import { Dimensions } from 'react-native'
import { isBrowser } from './platform'

let originalScreenHeight = 0

if (!originalScreenHeight) {
  originalScreenHeight = Dimensions.get('window').height
}

let originalScreenWidth = 0

if (!originalScreenWidth) {
  originalScreenWidth = Dimensions.get('window').width
}

const eventListeners = new WeakMap()

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
  const changeHandler = () =>
    callback({
      portrait: isPortrait(),
      height: getScreenHeight(),
      width: getScreenWidth(),
    })

  eventListeners.set(callback, changeHandler)
  Dimensions.addEventListener('change', changeHandler)
}

export const unlistenOrientationChange = callback => {
  if (!eventListeners.has(callback)) {
    return
  }

  const changeHandler = eventListeners.get(callback)

  eventListeners.delete(callback)
  Dimensions.removeEventListener('change', changeHandler)
}

export default listenOrientationChange
