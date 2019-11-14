// @flow
import React, { useEffect } from 'react'
import LoadingIcon from '../modal/LoadingIcon'
import { useConnection } from '../../../lib/hooks/hasConnectionChange'
import { useDialog } from '../../../lib/undux/utils/dialog'

const InternetConnection = () => {
  const [showDialog, hideDialog] = useDialog()
  const isConnection = useConnection()

  useEffect(() => {
    if (isConnection === false) {
      showDialog({
        title: 'Waiting for network',
        image: <LoadingIcon />,
        message: 'check your internet connection',
        showButtons: false,
        showCloseButtons: false,
      })
    } else {
      hideDialog()
    }
  }, [isConnection])

  return null
}

export default InternetConnection
