// @flow

// libraries
import React, { useCallback, useEffect } from 'react'
import { noop } from 'lodash'

// components
import GeneralUnsupportedBrowserDialog from '../../components/common/dialogs/unsupportedBrowser/General'

// hooks
import useMountedState from '../../lib/hooks/useMountedState'
import { useDialog } from '../undux/utils/dialog'

// utils
import logger from '../logger/pino-logger'
import { isBrowser, isChrome, isIOSWeb, isMobileWeb, isSafari } from '../utils/platform'

const log = logger.child({ from: 'useUnsupportedBrowser' })

const defaultBrowserCompatibilityRule =
  (isIOSWeb && isSafari) || (isMobileWeb && isChrome) || (isBrowser && (isSafari || isChrome))

const useUnsupportedBrowser = (options = {}) => {
  const {
    requestOnMounted = true,
    onAllowed = noop,
    onDenied = noop,
    DialogComponent = GeneralUnsupportedBrowserDialog,
    browserCompatibility = defaultBrowserCompatibilityRule,
  } = options

  const [showDialog] = useDialog()
  const mountedState = useMountedState()

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

  const handleDenied = useCallback(
    () =>
      showPopup({
        type: 'error',
        content: <DialogComponent onDismiss={onDenied} />,
        onDismiss: onDenied,
      }),
    [onDenied, showPopup],
  )

  const requestFlow = useCallback(() => {
    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happers during processing transaction
    if (!mountedState.current) {
      return
    }

    log.debug({
      browserCompatibility,
    })

    if (!browserCompatibility) {
      handleDenied()
      return
    }

    onAllowed()
  }, [mountedState, onAllowed, handleDenied])

  const checkBrowserCompatibility = useCallback(() => {
    if (!requestOnMounted) {
      requestFlow()
    }
  }, [requestFlow, requestOnMounted])

  useEffect(() => {
    if (requestOnMounted) {
      requestFlow()
    }
  }, [])

  return [browserCompatibility, checkBrowserCompatibility]
}

export default useUnsupportedBrowser
