// @flow

import React, { useCallback, useEffect, useState } from 'react'

import { noop } from 'lodash'

import { type Permission, Permissions, PermissionStatuses } from '../types'

import CameraPermissionDialog from '../components/CameraPermissionDialog'
import ClipboardPermissionDialog from '../components/ClipboardPermissionDialog'
import DeniedCameraPermissionDialog from '../components/DeniedCameraPermissionDialog'
import DeniedClipboardPermissionDialog from '../components/DeniedClipboardPermissionDialog'

import { useDialog } from '../../../lib/undux/utils/dialog'
import useMountedState from '../../../lib/hooks/useMountedState'

import api from '../api/PermissionsAPI'
import { isSafari } from '../../../lib/utils/platform'

const { Clipboard, Camera } = Permissions
const { Undetermined, Granted, Denied, Prompt } = PermissionStatuses

const usePermissions = (permission: Permission, options = {}) => {
  const { promptPopups, deniedPopups } = usePermissions
  const { onAllowed = noop, onDenied = noop, requestOnMounted = true, promptPopup, deniedPopup } = options

  const [showDialog] = useDialog()
  const mountedState = useMountedState()
  const [allowed, setAllowed] = useState(false)

  const PromptPopup = promptPopup || promptPopups[permission]
  const DeniedPopup = deniedPopup || deniedPopups[permission]

  const showPopup = useCallback(
    ({ onDismiss = noop, ...props }) =>
      showDialog({
        isMinHeight: false,
        onDismiss,
        ...props,
      }),
    [showDialog]
  )

  const handleAllowed = useCallback(() => {
    onAllowed()

    if (mountedState.current) {
      setAllowed(true)
    }
  }, [onAllowed, setAllowed])

  const handleDenied = useCallback(
    () =>
      showPopup({
        type: 'error',
        content: <DeniedPopup />,
        onDismiss: onDenied,
      }),
    [onDenied, showPopup, DeniedPopup]
  )

  const handleRequest = useCallback(async () => {
    const isAllowed = await api.request(permission)

    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happers during processing transaction
    if (!mountedState.current) {
      return
    }

    if (!isAllowed) {
      handleDenied()
      return
    }

    handleAllowed()
  }, [permission, handleAllowed, handleDenied])

  const handleRequestFlow = useCallback(async () => {
    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happers during processing transaction
    if (!mountedState.current) {
      return
    }

    const status = await api.check(permission)

    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happers during processing transaction
    if (!mountedState.current) {
      return
    }

    switch (status) {
      case Prompt:
        showPopup({
          content: <PromptPopup />,
          onDismiss: handleRequest,
        })
        break
      case Granted:
        handleAllowed()
        break
      case Denied:
        handleDenied()
        break
      case Undetermined:
        // skipping clipboard permission request on Safari because it doesn't grants clipboard-read globally like Chrome
        // In Safari you should confirm each clipboard read operation by clicking "Paste" in the context menu appers when you're calling readText()
        if (Clipboard === permission && isSafari) {
          handleAllowed()
          break
        }

        handleRequest()
        break
    }
  }, [PromptPopup, handleRequest])

  const requestPermission = useCallback(() => {
    if (!requestOnMounted) {
      handleRequestFlow()
    }
  }, [handleRequestFlow, requestOnMounted])

  useEffect(() => {
    if (requestOnMounted) {
      handleRequestFlow()
    }
  }, [])

  return [allowed, requestPermission]
}

usePermissions.promptPopups = {
  [Camera]: CameraPermissionDialog,
  [Clipboard]: ClipboardPermissionDialog,
}

usePermissions.deniedPopups = {
  [Camera]: DeniedCameraPermissionDialog,
  [Clipboard]: DeniedClipboardPermissionDialog,
}

export default usePermissions
