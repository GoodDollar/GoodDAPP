// @flow

// libraries
import React, { useCallback, useEffect, useState } from 'react'
import { noop } from 'lodash'

// components
import UnsupportedDialog from '../components/UnsupportedDialog'
import SwitchToSafariDialog from '../components/SwitchToSafariDialog'

// hooks
import useMountedState from '../../../lib/hooks/useMountedState'
import { useDialog } from '../../../lib/undux/utils/dialog'

// utils
import logger from '../../../lib/logger/pino-logger'
import { isBrowser, isChrome, isIOSWeb, isMobileWeb, isSafari } from '../../../lib/utils/platform'

const log = logger.child({ from: 'useBrowserSupport' })

export default (options = {}) => {
  const {
    onlyIOS = false,
    onChecked = noop,
    onSupported = noop,
    onUnsupported = noop,
    checkOnMounted = true,
    unsupportedPopup = null,
  } = options

  const [showDialog] = useDialog()
  const mountedState = useMountedState()
  const [isSupported, setSupported] = useState(false)

  // exactly UnsupportedDialog should be shown after sign-up
  // SwitchToSafariDialog should be show only for specific screens where onlyIOS prop is passed
  const UnsupportedPopup = unsupportedPopup || (isIOSWeb && onlyIOS ? SwitchToSafariDialog : UnsupportedDialog)

  const showPopup = useCallback(
    ({ onDismiss = noop, ...props }) =>
      showDialog({
        isMinHeight: false,
        showButtons: false,
        onDismiss,
        ...props,
      }),
    [showDialog],
  )

  const handleSupported = useCallback(() => {
    onChecked(true)
    onSupported()

    if (mountedState.current) {
      setSupported(true)
    }
  }, [onChecked, onSupported, setSupported])

  const handleUnsupported = useCallback(() => {
    const onDismiss = () => {
      onChecked(false)
      onUnsupported()
    }

    showPopup({
      type: 'error',
      content: <UnsupportedPopup onDismiss={onDismiss} />,
      onDismiss: onDismiss,
    })
  }, [onChecked, onUnsupported, showPopup])

  const requestFlow = useCallback(() => {
    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happers during processing transaction
    if (!mountedState.current) {
      return
    }

    // there are some screens where we need to check just ios+safari
    // other verification not required then
    let isSupported = onlyIOS
      ? isIOSWeb
        ? isSafari
        : true
      : (isIOSWeb && isSafari) || (isMobileWeb && isChrome) || (isBrowser && (isSafari || isChrome))

    log.debug({ isSupported })

    isSupported ? handleSupported() : handleUnsupported()
  }, [onChecked, onSupported, handleUnsupported, handleSupported])

  const checkForBrowserSupport = useCallback(() => {
    if (!checkOnMounted) {
      requestFlow()
    }
  }, [requestFlow, checkOnMounted])

  useEffect(() => {
    if (checkOnMounted) {
      requestFlow()
    }
  }, [])

  return [isSupported, checkForBrowserSupport]
}
