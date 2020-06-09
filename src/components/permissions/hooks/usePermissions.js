// @flow

import React, { useEffect, useState } from 'react'

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
  const [showDialog] = useDialog()
  const mountedState = useMountedState()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happers during processing transaction
    if (!mountedState.current) {
      return
    }

    const { promptPopups, deniedPopups } = usePermissions
    const { onAllowed = noop, onDenied = noop, promptPopup, deniedPopup } = options
    const PromptPopup = promptPopup || promptPopups[permission]
    const DeniedPopup = deniedPopup || deniedPopups[permission]

    const showPopup = ({ onDismissed = noop, ...props }) =>
      showDialog({
        ...props,
        isMinHeight: false,
        buttons: [
          {
            text: 'OK',
            onPress: dismiss => {
              dismiss()
              onDismissed()
            },
          },
        ],
      })

    const handleAllowed = () => {
      onAllowed()

      if (mountedState.current) {
        setAllowed(true)
      }
    }

    const handleDenied = () =>
      showPopup({
        type: 'error',
        content: <DeniedPopup />,
        onDismissed: onDenied,
      })

    const requestPermission = async () => {
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
    }

    api.check(permission).then(status => {
      // re-checking mounted state after each delayed / async operation as send link
      // screen could call redirect back if error happers during processing transaction
      if (!mountedState.current) {
        return
      }

      switch (status) {
        case Prompt:
          showPopup({
            content: <PromptPopup />,
            onDismissed: requestPermission,
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

          requestPermission()
          break
      }
    })
  }, [])

  return allowed
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
