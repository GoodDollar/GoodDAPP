import { useCallback, useEffect, useRef } from 'react'
import { noop } from 'lodash'

import Clipboard from '../utils/Clipboard'
import logger from '../logger/pino-logger'
import { preventPressed } from './useOnPress'

const log = logger.child({ from: 'useClipboard Hook' })

// should be non-async to avoid possible 'non-user interaction' issues
const writeString = content =>
  Clipboard.setString(content)
    .then(() => true)
    .catch(exception => {
      const { message } = exception

      log.warn('Copy to clipboard failed', message, exception)
      return false
    })

const useClipboard = () => {
  // should be non-async to avoid possible 'non-user interaction' issues
  const setString = useCallback(content => writeString(content), [])

  // Please use usePermissionsHook in places where this method will be used to check permissions first
  // eslint-disable-next-line require-await
  const getString = useCallback(async () => {
    try {
      return await Clipboard.getString()
    } catch (exception) {
      const { message } = exception

      log.warn('Paste from clipboard failed', message, exception)
    }
  }, [])

  return [getString, setString]
}

export const useClipboardPaste = onPaste => {
  const [getString] = useClipboard()

  return useCallback(async () => {
    const clipboardContents = await getString()

    onPaste(clipboardContents)
  }, [onPaste, getString])
}

export const useClipboardCopy = (content, onCopy = noop) => {
  const contentRef = useRef(content)
  const onCopyRef = useRef(onCopy)

  useEffect(() => {
    contentRef.current = content
    onCopyRef.current = onCopy
  }, [content, onCopy])

  return useCallback(event => {
    writeString(contentRef.current).then(onCopyRef.current)
    preventPressed(event)
  }, [])
}

export default useClipboard
