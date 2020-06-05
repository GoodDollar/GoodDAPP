import { useCallback } from 'react'
import Clipboard from '../utils/Clipboard'
import logger from '../logger/pino-logger'
import { useErrorDialog } from '../undux/utils/dialog'
import useOnPress from '../../lib/hooks/useOnPress'

const log = logger.child({ from: 'useClipboard Hook' })

export default () => {
  const [showErrorDialog] = useErrorDialog()

  const setString = useCallback(
    content => {
      try {
        Clipboard.setString(content)
        return true
      } catch (e) {
        if (e.name === 'NotAllowedError') {
          showErrorDialog("GoodDollar can't access your clipboard, please enable clipboard permission")

          log.warn('No clipboard permission', e.message, e, {
            content,
          })
        }

        return false
      }
    },
    [showErrorDialog]
  )

  return { setString }
}

export const useClipboardPaste = (onPaste, logger = log) =>
  useOnPress(async () => {
    try {
      const clipboardContents = await Clipboard.getString()
      onPaste(clipboardContents)
    } catch (exception) {
      const { message } = exception

      logger.warn('Paste action failed', message, exception)
    }
  }, [onPaste])
