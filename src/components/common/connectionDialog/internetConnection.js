// @flow
import React, { useEffect } from 'react'
import LoadingIcon from '../modal/LoadingIcon'
import { useConnection } from '../../../lib/hooks/hasConnectionChange'
import { useDialog } from '../../../lib/undux/utils/dialog'

const internetConnection = () => {
  const [showDialog] = useDialog()
  const isConnection = useConnection()
  useEffect(() => {
    if (!isConnection) {
      showDialog({
        title: 'Waiting for network',
        image: <LoadingIcon />,
        message: 'check your internet connection',
        buttons: [
          {
            text: 'Reload',
            onPress: () => {
              window.location.reload()
            },
          },
        ],
      })
    }
  }, [isConnection])

  return null
}

export default internetConnection
