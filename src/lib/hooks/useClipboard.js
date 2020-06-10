import React, { useCallback } from 'react'
import { Image, Platform } from 'react-native'

import ExplanationDialog from '../../components/common/dialogs/ExplanationDialog'
import illustration from '../../assets/ClipboardPermissionError.svg'

import { useDialog } from '../undux/utils/dialog'

import { isSafari } from '../utils/platform'
import Clipboard from '../utils/Clipboard'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'useClipboard Hook' })

if (Platform.OS === 'web') {
  Image.prefetch(illustration)
}

const NoClipboardAccessConfirmedInSafari = () => (
  <ExplanationDialog
    title="Please confirm paste from clipboard"
    text={`Click on the 'Paste' context menu item next time`}
    imageSource={illustration}
  />
)

const useClipboard = (logger = log) => {
  const [showDialog] = useDialog()

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
      const { name, message } = exception

      if (isSafari && 'NotAllowedError' === name) {
        // Safari shows context menu with 'paste' menu item each time we trying to paste from clipboard
        // if user closes this menu by clicking outside, 'NotAllowedError' will be thrown
        // in this case we'll show user an special popup with explanations what he should to do in Safari to paste
        showDialog({
          content: <NoClipboardAccessConfirmedInSafari />,
          isMinHeight: false,
          type: 'error',
        })
      }

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
