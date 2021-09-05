import { useCallback, useEffect, useRef } from 'react'

import logger from '../../lib/logger/js-logger'
import IframeManager from './iframe.manager'

const log = logger.child('IframeTab.web')

export const useIframeLoaded = (src, onLoaded) => {
  const isLoadedRef = useRef(false)

  const handleIframeLoaded = useCallback(
    event => {
      if (isLoadedRef.current) {
        return
      }

      log.debug('IFrame loaded', { src, event })
      isLoadedRef.current = true
      onLoaded()
    },
    [onLoaded, src],
  )

  const loadEventHandler = useCallback(() => handleIframeLoaded('load'), [handleIframeLoaded])

  useEffect(() => {
    const domLoadedEventHandler = () => handleIframeLoaded('DOMContentLoaded')

    IframeManager.addListener(src, domLoadedEventHandler)
    return () => IframeManager.removeListener(src, domLoadedEventHandler)
  }, [])

  return loadEventHandler
}
