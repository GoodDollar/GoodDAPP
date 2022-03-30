// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import { t } from '@lingui/macro'
import Config from '../../../config/config'
import LoadingIcon from '../modal/LoadingIcon'
import {
  useAPIConnection,
  useConnection,
  useWeb3Polling,

  // useConnectionGun,

  // useConnectionWeb3,
} from '../../../lib/hooks/hasConnectionChange'
import { useDialog } from '../../../lib/undux/utils/dialog'
import logger from '../../../lib/logger/js-logger'

const log = logger.child({ from: 'InternetConnection' })

const InternetConnection = props => {
  const [showDialog, hideDialog] = useDialog()
  const isConnection = useConnection()
  const isAPIConnection = useAPIConnection()
  useWeb3Polling()

  // const isConnectionWeb3 = useConnectionWeb3()
  // const isConnectionGun = useConnectionGun()
  const [showDisconnect, setShowDisconnect] = useState(false)
  const [firstLoadError, setFirstLoadError] = useState(true)

  const showDialogWindow = useCallback(
    debounce((message, showDialog, setShowDisconnect) => {
      setShowDisconnect(true)
      showDialog({
        title: t`Waiting for network`,
        image: <LoadingIcon />,
        message,
        showButtons: false,
        showCloseButtons: false,
      })
    }, Config.delayMessageNetworkDisconnection),
    [],
  )

  useEffect(() => {
    showDialogWindow.cancel()
    if (isConnection === false || isAPIConnection === false) {
      log.warn('connection failed:', {
        isAPIConnection,
        isConnection,

        // isConnectionWeb3,
        // isConnectionGun,
        firstLoadError,
      })

      //supress showing the error dialog while in splash and connecting
      if (firstLoadError) {
        return setShowDisconnect(true)
      }

      let message
      if (isConnection === false) {
        message = t`Check your internet connection`
      } else {
        const servers = []
        if (isAPIConnection === false) {
          servers.push('API')
        }

        // if (isConnectionWeb3 === false) {
        //   servers.push('Blockchain')
        // }
        // if (isConnectionGun === false) {
        //   servers.push('GunDB')
        // }
        message = t`Waiting for GoodDollar's server (${servers.join(', ')})`
      }

      showDialogWindow(message, showDialog, setShowDisconnect)
    } else {
      log.debug('connection back - hiding dialog')

      //first time that connection is ok, from now on we will start showing the connection dialog on error
      setFirstLoadError(false)
      showDialogWindow && showDialogWindow.cancel()

      // hideDialog should be executed only if the internetConnection dialog is shown.
      // otherwise it may close some another non related popup (e.g. Unsupported Browser, App Version Update)
      showDisconnect && !firstLoadError && hideDialog()
      setShowDisconnect(false)
    }
  }, [
    isConnection,
    isAPIConnection,

    // isConnectionWeb3,
    // isConnectionGun,
    setShowDisconnect,
    setFirstLoadError,
    firstLoadError,
    showDisconnect,
  ])

  return showDisconnect && props.showSplash && props.onDisconnect && props.isLoggedIn
    ? props.onDisconnect()
    : props.children
}

export default InternetConnection
