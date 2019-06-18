// @flow
import { Clipboard as NativeClipboard } from 'react-native'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
const log = logger.child({ from: 'Clipboard' })

/**
 * Uses Native clipboard to set the clipboard and navigator.clipboard to read
 */
const Clipboard = {
  /**
   * @returns {string}
   */
  getString: () => navigator.clipboard.readText(),
  /**
   * @param {string} text
   */
  setString: (text: string) => {
    log.debug('setString', text)
    NativeClipboard.setString(text)
  }
}

export const useSetClipboard = () => {
  const store = GDStore.useStore()

  return (text: string) => {
    Clipboard.setString(text)
    store.set('snackbarData')({ visible: true, text: 'Copied to clipboard' })
  }
}

export default Clipboard
