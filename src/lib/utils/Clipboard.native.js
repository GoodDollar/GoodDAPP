// @flow
import { Clipboard as NativeClipboard } from 'react-native'

const Clipboard = {
  getString: () => NativeClipboard.getString(),
  setString: (text: string) => NativeClipboard.setString(text)
}

export default Clipboard
