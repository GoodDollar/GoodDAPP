// @flow

// libraries
import React, { useCallback, useEffect, useState } from 'react'
import { isFunction, noop } from 'lodash'

// components
import SwitchToChromeOrSafari from '../components/SwitchToChromeOrSafari'
import UpdateIOS from '../components/UpdateIOS'

// hooks
import useMountedState from '../../../lib/hooks/useMountedState'
import { useDialog } from '../../../lib/undux/utils/dialog'

// utils
import logger from '../../../lib/logger/js-logger'
import { isAndroidWeb, isBrowser, isChrome, isIOSWeb, isSafari, osVersionInfo } from '../../../lib/utils/platform'
import Config from '../../../config/config'

const log = logger.child({ from: 'useBrowserSupport' })

export default (options = {}) => {
  const {
    onCheck = null,
    onChecked = noop,
    onSupported = noop,
    onUnsupported = noop,
    checkOnMounted = true,
    unsupportedPopup = null,
    outdatedPopup = null,
    checkOutdated = true,
  } = options

  const [showDialog] = useDialog()
  const mountedState = useMountedState()
  const [isSupported, setSupported] = useState(false)
  const UnsupportedPopup = unsupportedPopup || SwitchToChromeOrSafari
  const OutdatedPopup = outdatedPopup || UpdateIOS

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

  const handleUnsupported = useCallback(
    isOutdated => {
      const PopupComponent = isOutdated ? OutdatedPopup : UnsupportedPopup

      const onDismiss = () => {
        onChecked(false)
        onUnsupported()
      }

      showPopup({
        type: 'error',
        content: <PopupComponent onDismiss={onDismiss} />,
        onDismiss: onDismiss,
      })
    },
    [onChecked, onUnsupported, showPopup],
  )

  const requestFlow = useCallback(() => {
    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happers during processing transaction
    if (!mountedState.current) {
      return
    }

    let isOutdated = false
    let isSupported = (isIOSWeb && isSafari) || (isAndroidWeb && isChrome) || (isBrowser && (isSafari || isChrome))

    if (isFunction(onCheck)) {
      isSupported = onCheck(isSupported)
    }

    log.debug({ isSupported })

    if (isSupported && checkOutdated && isIOSWeb) {
      const { major: iOSVersionMajor } = osVersionInfo

      if (iOSVersionMajor < Config.minimalIOSVersion) {
        isOutdated = true
      }
    }

    if (isSupported && !isOutdated) {
      handleSupported()
    } else {
      handleUnsupported(isOutdated)
    }
  }, [checkOutdated, onChecked, onSupported, handleUnsupported, handleSupported])

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
