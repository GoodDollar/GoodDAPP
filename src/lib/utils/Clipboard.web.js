// @flow
import { Clipboard as NativeClipboard } from 'react-native'

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
  setString: (text: string) => NativeClipboard.setString(text)
}

export default Clipboard
