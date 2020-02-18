// @flow
import React, { useEffect, useState } from 'react'
import debounce from 'lodash/debounce'
import Config from '../../../config/config'
import LoadingIcon from '../modal/LoadingIcon'
import {
  useAPIConnection,
  useConnection,
  useConnectionGun,

  /*&useConnectionWeb3,*/
} from '../../../lib/hooks/hasConnectionChange'
import { useDialog } from '../../../lib/undux/utils/dialog'
import logger from '../../../lib/logger/pino-logger'

const log = logger.child({ from: 'InternetConnection' })
const showDialogWindow = debounce((showDialog, message, setShowContent) => {
  setShowContent(true)
  showDialog({
    title: 'Waiting for network',
    image: <LoadingIcon />,
    message,
    showButtons: false,
    showCloseButtons: false,
  })
}, Config.delayMessageNetworkDisconnection)

const InternetConnection = props => {
  const [showDialog, hideDialog] = useDialog()
  const isConnection = useConnection()
  const isAPIConnection = useAPIConnection()

  //FIXME:RN restore connection tests, goes crazy on android emulator.
  const isConnectionWeb3 = true //useConnectionWeb3()
  const isConnectionGun = useConnectionGun()
  const [showContent, setShowContent] = useState(false)
  useEffect(() => {
    if (
      isConnection === false ||
      isAPIConnection === false ||
      isConnectionWeb3 === false ||
      isConnectionGun === false
    ) {
      log.warn('connection failed:', '', {}, { isAPIConnection, isConnection, isConnectionWeb3, isConnectionGun })
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
      showDialogWindow(showDialog, message, setShowContent)
    } else {
      log.debug('connection back hiding dialog')
      showDialogWindow && showDialogWindow.cancel()
      hideDialog()
      setShowContent(false)
    }
  }, [isConnection, isAPIConnection, isConnectionWeb3, isConnectionGun])

  return showContent && props.isLoggedIn ? props.onDisconnect() : props.children
}

export default InternetConnection
