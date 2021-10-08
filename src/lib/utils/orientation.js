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

const eventSubscriptions = new WeakMap()

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

  const subscription = Dimensions.addEventListener('change', changeHandler)

  eventSubscriptions.set(callback, subscription)
}

export const unlistenOrientationChange = callback => {
  if (!eventSubscriptions.has(callback)) {
    return
  }

  const subscription = eventSubscriptions.get(callback)

  eventSubscriptions.delete(callback)
  subscription.remove()
}

export default listenOrientationChange
