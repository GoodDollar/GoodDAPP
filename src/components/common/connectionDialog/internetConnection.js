// @flow
import React, { useEffect } from 'react'
import LoadingIcon from '../modal/LoadingIcon'
import { useAPIConnection, useConnection } from '../../../lib/hooks/hasConnectionChange'
import { useDialog } from '../../../lib/undux/utils/dialog'

const InternetConnection = () => {
  const [showDialog, hideDialog] = useDialog()
  const isConnection = useConnection()
  const isAPIConnection = useAPIConnection()

  useEffect(() => {
    if (isConnection === false || isAPIConnection === false) {
      showDialog({
        title: 'Waiting for network',
        image: <LoadingIcon />,
        message: isAPIConnection === false ? "Waiting for GoodDollar's server" : 'Check your internet connection',
        showButtons: false,
        showCloseButtons: false,
      })
    } else {
      hideDialog()
    }
  }, [isConnection, isAPIConnection])

  return null
}

export default InternetConnection
