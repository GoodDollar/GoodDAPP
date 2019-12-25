// @flow
import { Clipboard as NativeClipboard } from 'react-native'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'Clipboard' })

/**
 * Uses Native clipboard to set the clipboard and navigator.clipboard to read
 */
const Clipboard = {
  /**
   * @returns {string}
   */
  getString: () => {
    const text = navigator.clipboard.readText()
    log.debug('getString', text)
    return text
  },

  /**
   * @param {string} text
   */
  setString: (text: string) => {
    log.debug('setString', text)
    NativeClipboard.setString(text)
  },
}

export default Clipboard
