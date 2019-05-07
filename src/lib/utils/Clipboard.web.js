// @flow
import { Clipboard as NativeClipboard } from 'react-native'

const Clipboard = {
  getString: () => navigator.clipboard.readText(),
  setString: (text: string) => NativeClipboard.setString(text)
}

export default Clipboard
