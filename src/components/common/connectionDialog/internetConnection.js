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
import logger from '../../../lib/logger/pino-logger'
const log = logger.child({ from: 'InternetConnection' })

const InternetConnection = props => {
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
      log.debug('connection issue showing dialog')
      showDialog({
        title: 'Waiting for network',
        image: <LoadingIcon />,
        message: isAPIConnection === false ? "Waiting for GoodDollar's server" : 'Check your internet connection',
        showButtons: false,
        showCloseButtons: false,
      })
    } else {
      log.debug('connection back hiding dialog')
      hideDialog()
    }
  }, [isConnection, isAPIConnection, isConnectionWeb3, isConnectionGun])

  const disconnected =
    isConnection === false || isAPIConnection === false || isConnectionWeb3 === false || isConnectionGun === false
  return disconnected ? props.onDisconnect() : props.children
}

export default InternetConnection
