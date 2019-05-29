// @flow
import { Clipboard as NativeClipboard } from 'react-native'

/**
 * Uses Native clipboard to set the clipboard and navigator.clipboard to read
 */
const Clipboard = {
  getString: () => navigator.clipboard.readText(),
  setString: (text: string) => NativeClipboard.setString(text)
}

export default Clipboard
