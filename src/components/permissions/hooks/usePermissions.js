// @flow

import React, { useCallback, useEffect, useState } from 'react'

import { noop } from 'lodash'

import { type Permission, Permissions, PermissionStatuses } from '../types'

import CameraPermissionDialog from '../components/CameraPermissionDialog'
import ClipboardPermissionDialog from '../components/ClipboardPermissionDialog'
import NotificationsPermissionDialog from '../components/NotificationsPermissionDialog'
import DeniedCameraPermissionDialog from '../components/DeniedCameraPermissionDialog'
import DeniedClipboardPermissionDialog from '../components/DeniedClipboardPermissionDialog'
import DeniedNotificationsPermissionDialog from '../components/DeniedNotificationsPermissionDialog'

import { useDialog } from '../../../lib/dialog/useDialog'
import useMountedState from '../../../lib/hooks/useMountedState'

import api from '../api/PermissionsAPI'
import { isSafari } from '../../../lib/utils/platform'

const { Clipboard, Camera, Notifications } = Permissions
const { Undetermined, Granted, Denied, Prompt, Disabled } = PermissionStatuses

const usePermissions = (permission: Permission, options = {}) => {
  const { promptPopups, deniedPopups } = usePermissions
  const {
    onAllowed = noop,
    onPrompt = noop,
    onDenied = noop,
    requestOnMounted = true,
    promptPopup,
    deniedPopup,
    navigate,
  } = options

  const { showDialog } = useDialog()
  const [mountedState] = useMountedState()
  const [allowed, setAllowed] = useState(false)

  const PromptPopup = promptPopup || promptPopups[permission]
  const DeniedPopup = deniedPopup || deniedPopups[permission]

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
        content: <DeniedPopup onDismiss={onDenied} navigate={navigate} />,
        onDismiss: onDenied,
      }),
    [onDenied, showPopup, DeniedPopup],
  )

  const handleRequest = useCallback(async () => {
    const isAllowed = await api.request(permission)

    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happens during processing transaction
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
    // screen could call redirect back if error happens during processing transaction
    if (!mountedState.current) {
      return
    }

    const status = await api.check(permission)

    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happens during processing transaction
    if (!mountedState.current) {
      return
    }

    const onPrompted = result => (true === result) ? handleRequest() : handleDenied()

    switch (status) {
      case Prompt:
        showPopup({
          content: <PromptPopup onDismiss={onPrompted} />,
          onDismiss: onPrompted,
        })

        onPrompt()
        break
      case Granted:
        handleAllowed()
        break
      case Denied:
        handleDenied()
        break
      case Disabled:
        // TODO: maybe we would need to handle disabled case separately
        // and run correspinding callback prop. for now it will just
        // call onDenied but without showing denied dialog
        onDenied()
        break
      case Undetermined:
      default:
        // skipping clipboard permission request on Safari because it doesn't grants clipboard-read globally like Chrome
        // In Safari you should confirm each clipboard read operation by clicking "Paste" in the context menu appears when you're calling readText()
        if (Clipboard === permission && isSafari) {
          handleAllowed()
          break
        }

        onPrompt()
        handleRequest()
        break
    }
  }, [PromptPopup, onPrompt, handleRequest])

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

  // TODO: maybe we would need to return disabled status separately
  // for now it permission disabled it will return allowed false
  return [allowed, requestPermission]
}

usePermissions.promptPopups = {
  [Camera]: CameraPermissionDialog,
  [Clipboard]: ClipboardPermissionDialog,
  [Notifications]: NotificationsPermissionDialog,
}

usePermissions.deniedPopups = {
  [Camera]: DeniedCameraPermissionDialog,
  [Clipboard]: DeniedClipboardPermissionDialog,
  [Notifications]: DeniedNotificationsPermissionDialog,
}

export default usePermissions
