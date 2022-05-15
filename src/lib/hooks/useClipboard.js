import { useCallback } from 'react'
import { noop } from 'lodash'

import { delay as waitFor } from '../utils/async'
import Clipboard from '../utils/Clipboard'

import logger from '../logger/js-logger'
import usePropsRefs from './usePropsRefs'
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

export const useClipboardCopy = (content, onCopy = noop, delay = null) => {
  const refs = usePropsRefs([onCopy, content, delay])

  return useCallback(
    event => {
      const [onCopy, getContent, getDelay] = refs

      // optionally, awaiting for delay ms before fire onCopy
      // this may be needed in some cases (e.g. aminated buttons)
      // because postponing copy action with setTimeout will cause
      // NotAllowedError as it won't be a direct user interaction
      const copyToClipboard = async () => {
        const [isSuccess] = await Promise.all([writeString(getContent()), waitFor(getDelay() || 0)])

        onCopy(isSuccess)
      }

      copyToClipboard()
      preventPressed(event)
    },
    [refs],
  )
}

export default useClipboard
