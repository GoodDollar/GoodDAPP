// @flow
import { noop } from 'lodash'
import React, { useEffect, useState } from 'react'
import { type Permission, Permissions } from '../types'

import CameraPermissionsDialog from '../components/CameraPermissionsDialog'
import ClipboardPermissionsDialog from '../components/ClipboardPermissionsDialog'

import { useDialog } from '../../../lib/undux/utils/dialog'
import useMountedState from '../../../lib/hooks/useMountedState'

import api from '../api/PermissionsAPI'

const usePermissions = (permission: Permission, callbacks = {}) => {
  const [showDialog] = useDialog()
  const mountedState = useMountedState()
  const { onAllowed = noop, onDenied = noop } = callbacks
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const PopupComponent = usePermissions.popups[permission]

    const showPermissionsPopup = showDialog({
      content: <PopupComponent />,
      isMinHeight: false,
      buttons: [
        {
          text: 'OK',
          onPress: dismiss => {
            dismiss()
            onDenied()
          },
        },
      ],
    })

    const queryPermissions = async () => {
      const isAllowed = await api.query(permission)

      if (!isAllowed) {
        showPermissionsPopup()
        return
      }

      onAllowed()

      if (mountedState.current) {
        setAllowed(isAllowed)
      }
    }

    queryPermissions()
  }, [])

  return allowed
}

usePermissions.popups = {
  [Permissions.CAMERA]: CameraPermissionsDialog,
  [Permissions.CLIPBOARD]: ClipboardPermissionsDialog,
}

export default usePermissions
