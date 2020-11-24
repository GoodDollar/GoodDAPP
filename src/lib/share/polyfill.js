import { Platform, Share } from 'react-native'
import { isAndroidWeb, isWeb } from '../utils/platform'
import { noopAsync } from '../utils/async'

export const isWebSharingAvailable = isWeb && !!navigator.share
export const isSharingEmulated = 'true' === process.env.REACT_APP_EMULATE_SHARING

const nativeShare = shareObject => Share.share(shareObject)

// eslint-disable-next-line require-await
const emulatedShareWeb = async ({ url }) => {
  const result = window.confirm(`Share ${url} ?`)

  if (result) {
    return
  }

  const exception = new Error('User cancelled sharing')

  exception.name = 'AbortError'
  throw exception
}

let timeoutId
let lastListener
const listenEvents = ['focus', 'touchstart']

const removeListener = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  listenEvents.forEach(event => window.removeEventListener(event, lastListener))
  lastListener = null
}

// should be non-async to avoid possible 'non-user interaction' issues
const androidShareWeb = shareObject =>
  new Promise((resolve, reject) => {
    let sharingPromise
    const exceptionHandler = exception => {
      const { message } = exception

      // Differentiate between user 'AbortError' and internal errors.
      // E.g. Internal error: could not connect to Web Share interface.
      if (message.startsWith('Internal error:')) {
        exception.name = 'InternalError'
      }

      reject(exception)
    }

    removeListener()

    lastListener = () => {
      removeListener()
      timeoutId = setTimeout(resolve, 100)
    }

    listenEvents.forEach(event => window.addEventListener(event, lastListener))

    try {
      sharingPromise = nativeShare(shareObject)
    } catch (exception) {
      exceptionHandler(exception)
      return
    }

    sharingPromise
      .then(resolve)
      .catch(exceptionHandler)
      .finally(removeListener)
  })

export default Platform.select({
  default: noopAsync,
  native: nativeShare,
  web: isWebSharingAvailable // if sharing available then
    ? // select window focus event workaround for Android, navigator's share otherwise
      isAndroidWeb
      ? androidShareWeb
      : nativeShare
    : // if no sharing available, emulate it if REACT_APP_EMULATE_SHARING debug flag was set
    isSharingEmulated
    ? emulatedShareWeb
    : noopAsync,
})
