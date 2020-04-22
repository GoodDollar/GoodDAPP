// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import Config from '../../../config/config'
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
  const [showDisconnect, setShowDisconnect] = useState(false)
  const [firstLoadError, setFirstLoadError] = useState(true)
  const showDialogWindow = useCallback(
    debounce((message, showDialog, setShowDisconnect) => {
      setShowDisconnect(true)
      showDialog({
        title: 'Waiting for network',
        image: <LoadingIcon />,
        message,
        showButtons: false,
        showCloseButtons: false,
      })
    }, Config.delayMessageNetworkDisconnection),
    []
  )

  useEffect(() => {
    showDialogWindow.cancel()
    if (
      isConnection === false ||
      isAPIConnection === false ||
      isConnectionWeb3 === false ||
      isConnectionGun === false
    ) {
      log.warn('connection failed:', {
        isAPIConnection,
        isConnection,
        isConnectionWeb3,
        isConnectionGun,
        firstLoadError,
      })

      // supress showing the error dialog while in splash and connecting
      if (firstLoadError) {
        return setShowDisconnect(true)
      }

      let message
      if (isConnection === false) {
        message = 'Check your internet connection'
      } else {
        const servers = []
        if (isAPIConnection === false) {
          servers.push('API')
        }
        if (isConnectionWeb3 === false) {
          servers.push('Blockchain')
        }
        if (isConnectionGun === false) {
          servers.push('GunDB')
        }
        message = `Waiting for GoodDollar's server (${servers.join(', ')})`
      }

      showDialogWindow(message, showDialog, setShowDisconnect)
    } else {
      log.debug('connection back hiding dialog')

      //first time that connection is ok, from now on we will start showing the connection dialog on error
      setFirstLoadError(false)
      showDialogWindow && showDialogWindow.cancel()
      hideDialog()
      setShowDisconnect(false)
    }
  }, [isConnection, isAPIConnection, isConnectionWeb3, isConnectionGun])

  return showDisconnect && props.isLoggedIn ? props.onDisconnect() : props.children
}

export default InternetConnection
