import { useCallback } from 'react'
import Clipboard from '../utils/Clipboard'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'useClipboard Hook' })

const logPermissionsDenied = (exception, content = null) => {
  const { name, message } = exception

  if ('NotAllowedError' === name) {
    const logPayload = content ? { content } : {}

    log.warn('No clipboard permission', message, exception, logPayload)
  }
}

export default () => {
  const setString = useCallback(async content => {
    try {
      await Clipboard.setString(content)
      return true
    } catch (exception) {
      logPermissionsDenied(exception, content)

      return false
    }
  }, [])

  // Please use usePermissionsHook in placves where this method will be used to check permissions first
  // eslint-disable-next-line require-await
  const getString = useCallback(async () => {
    try {
      return Clipboard.getString()
    } catch (exception) {
      logPermissionsDenied(exception)
    }
  }, [])

  return [getString, setString]
}

export const useClipboardPaste = (onPaste, logger = log) =>
  useCallback(async () => {
    try {
      const clipboardContents = await Clipboard.getString()

      onPaste(clipboardContents)
    } catch (exception) {
      const { message } = exception

      logger.warn('Paste action failed', message, exception)
    }
  }, [onPaste])
