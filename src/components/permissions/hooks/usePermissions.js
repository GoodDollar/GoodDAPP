// @flow

import { useEffect, useState } from 'react'

import { noop } from 'lodash'

import { type Permission, Permissions, PermissionStatuses } from '../types'

import CameraPermissionsDialog from '../components/CameraPermissionsDialog'
import ClipboardPermissionsDialog from '../components/ClipboardPermissionsDialog'

import { useDialog } from '../../../lib/undux/utils/dialog'

import api from '../api/PermissionsAPI'

const usePermissions = (permission: Permission, callbacks = {}) => {
  const [showDialog] = useDialog()
  const { onAllowed = noop, onDenied = noop } = callbacks
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const showPermissionsPopup = ({ onConfirm = noop, ...props }) =>
      showDialog({
        ...props,
        isMinHeight: false,
        buttons: [
          {
            text: 'OK',
            onPress: dismiss => {
              dismiss()
              onConfirm()
            },
          },
        ],
      })

    const requestPermission = async () => {
      const isAllowed = await api.request(permission)

      setAllowed(isAllowed)

      if (!isAllowed) {
        showPermissionsPopup({
          content: usePermissions.popups[`${permission}_${PermissionStatuses.DENIED}`],
        })

        return onDenied()
      }

      onAllowed()
    }

    const queryPermissions = async () => {
      const status = await api.check(permission)

      switch (status) {
        case PermissionStatuses.GRANTED:
          setAllowed(true)
          onAllowed()
          break

        case PermissionStatuses.DENIED:
          showPermissionsPopup({
            content: usePermissions.popups[`${permission}_${PermissionStatuses.DENIED}`],
          })
          setAllowed(false)
          onDenied()
          break

        case PermissionStatuses.PROMPT:
          showPermissionsPopup({
            content: usePermissions.popups[`${permission}_${PermissionStatuses.PROMPT}`],
            onConfirm: requestPermission,
          })
          break

        case PermissionStatuses.UNDETERMINED:
          requestPermission()
          break
      }
    }

    queryPermissions()
  }, [])

  return allowed
}

usePermissions.popups = {
  [`${Permissions.CAMERA}_${PermissionStatuses.DENIED}`]: CameraPermissionsDialog, // todo paste error dialog
  [`${Permissions.CAMERA}_${PermissionStatuses.PROMPT}`]: CameraPermissionsDialog, // todo paste info dialog
  [`${Permissions.CLIPBOARD_WRITE}_${PermissionStatuses.DENIED}`]: ClipboardPermissionsDialog, // todo paste error dialog
  [`${Permissions.CLIPBOARD_WRITE}_${PermissionStatuses.PROMPT}`]: ClipboardPermissionsDialog, // todo paste info dialog
}

export default usePermissions
