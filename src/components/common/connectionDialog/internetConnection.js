// @flow
import React, { useEffect } from 'react'
import LoadingIcon from '../modal/LoadingIcon'
import {
  useAPIConnection,
  useConnection,
  useConnectionGun,
  useConnectionWeb3,
} from '../../../lib/hooks/hasConnectionChange'
import { useDialog } from '../../../lib/undux/utils/dialog'

const InternetConnection = () => {
  const [showDialog, hideDialog] = useDialog()
  const isConnection = useConnection()
  const isAPIConnection = useAPIConnection()
  const isConnectionWeb3 = useConnectionWeb3()
  const isConnectionGun = useConnectionGun()
  useEffect(() => {
    if (
      isConnection === false ||
      isAPIConnection === false ||
      isConnectionWeb3 === false ||
      isConnectionGun === false
    ) {
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
  }, [isConnection, isAPIConnection, isConnectionWeb3, isConnectionGun])

  return null
}

export default InternetConnection
