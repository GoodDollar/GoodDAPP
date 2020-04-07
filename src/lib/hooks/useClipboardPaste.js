// @flow
import { useCallback } from 'react'

import Clipboard from '../utils/Clipboard'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'useClipboardPaste' })

export default (onPaste, logger = log) =>
  useCallback(async () => {
    try {
      const clipboardContents = await Clipboard.getString()

      onPaste(clipboardContents)
    } catch (exception) {
      const { message } = exception

      logger.error('Paste action failed', message, exception)
    }
  }, [onPaste])
