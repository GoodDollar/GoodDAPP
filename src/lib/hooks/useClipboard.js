import { useCallback } from 'react'
import { Image, Platform } from 'react-native'

import illustration from '../../assets/ClipboardPermissionError.svg'

import Clipboard from '../utils/Clipboard'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'useClipboard Hook' })

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const useClipboard = (logger = log) => {
  const setString = useCallback(async content => {
    try {
      await Clipboard.setString(content)
      return true
    } catch (exception) {
      const { message } = exception

      log.warn('Copy to clipboard failed', message, exception)
      return false
    }
  }, [])

  // Please use usePermissionsHook in places where this method will be used to check permissions first
  // eslint-disable-next-line require-await
  const getString = useCallback(async () => {
    try {
      const text = await Clipboard.getString()

      return text
    } catch (exception) {
      const { message } = exception

      log.warn('Paste from clipboard failed', message, exception)
    }
  }, [])

  return [getString, setString]
}

export const useClipboardPaste = (onPaste, logger = log) => {
  const [getString] = useClipboard(logger)

  return useCallback(async () => {
    const clipboardContents = await getString()

    onPaste(clipboardContents)
  }, [onPaste, getString])
}

export default useClipboard
