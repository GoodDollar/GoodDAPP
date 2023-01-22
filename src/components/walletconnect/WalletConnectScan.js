// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { t } from '@lingui/macro'
import { first, get } from 'lodash'

// components
import Wrapper from '../common/layout/Wrapper'

import { withStyles } from '../../lib/styles'
import { isMobile } from '../../lib/utils/platform'
import QRCameraPermissionDialog from '../dashboard/SendRecieveQRCameraPermissionDialog'

// hooks
import usePermissions from '../permissions/hooks/usePermissions'
import { Permissions } from '../permissions/types'
import useCameraSupport from '../browserSupport/hooks/useCameraSupport'
import { useClipboardPaste } from '../../lib/hooks/useClipboard'

// utils
import logger from '../../lib/logger/js-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/exceptions/utils'
import { useDialog } from '../../lib/dialog/useDialog'
import normalize from '../../lib/utils/normalizeText'
import { readWalletConnectUri, useWalletConnectSession } from '../../lib/wallet/WalletConnectClient'
import { ConnectedState, Divider, PasteCode, ScanCode } from './components'
const log = logger.child({ from: 'WalletConnectScan' })

const TITLE = `WalletConnect`

const QR_DEFAULT_DELAY = 2000

type WalletConnectProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const WalletConnectScan = ({ screenProps, styles, theme, navigation }: WalletConnectProps) => {
  const [qrDelay, setQrDelay] = useState(QR_DEFAULT_DELAY)
  const wcIncomingLink = get(navigation, 'state.params.wcUri')
  const {
    wcConnect: setWalletConnectUri,
    wcConnected,
    wcSession,
    wcDisconnect,
    wcSwitchChain,
    wcChain,
    chainPendingTxs,
    cancelTx,
    isWCDialogShown,
  } = useWalletConnectSession()

  const [uri, setUri] = useState('')
  const { showErrorDialog } = useDialog()

  const { navigateTo } = screenProps

  const handleChange = useCallback(
    data => {
      log.debug('handleChange:', { data })

      if (data) {
        try {
          const validUri = readWalletConnectUri(data)

          if (validUri === null) {
            const error = new Error('Invalid QR Code.')

            log.warn('Wrong QR code received', error.message, error, {
              validUri,
              category: ExceptionCategory.Human,
              dialogShown: true,
            })

            showErrorDialog(t`Invalid QR Code.`)
            setQrDelay(QR_DEFAULT_DELAY)
          } else {
            log.info('walletconnect uri:', { validUri })
            setWalletConnectUri(validUri)
          }
        } catch (e) {
          log.error('scan received failed', e.message, e)
          setQrDelay(QR_DEFAULT_DELAY)
          throw e
        }
      }
    },
    [setQrDelay, setWalletConnectUri, showErrorDialog],
  )

  useEffect(() => {
    if (wcIncomingLink && readWalletConnectUri(wcIncomingLink)) {
      handleChange(wcIncomingLink)
    }
  }, [wcIncomingLink, handleChange, readWalletConnectUri])

  const pasteUri = useClipboardPaste(data => {
    setUri(data)
  })

  // check clipboard permission an show dialog is not allowed
  const [, requestClipboardPermissions] = usePermissions(Permissions.Clipboard, {
    requestOnMounted: false,
    onAllowed: pasteUri,
    navigate: screenProps.navigate,
  })
  const handlePastePress = useCallback(requestClipboardPermissions)

  const [hasCameraAccess, requestPermission] = usePermissions(Permissions.Camera, {
    requestOnMounted: false,
    promptPopup: QRCameraPermissionDialog,
    navigate: navigateTo,
  })

  const handleError = useCallback(
    exception => {
      const dialogOptions = { title: 'QR code scan failed' }
      const { name, message } = exception
      const uiMessage = decorate(exception, ExceptionCode.E7)

      if ('NotAllowedError' === name) {
        // exit the function and do nothing as we already displayed error popup via usePermission hook
        return
      }

      log.error('QR scan send failed', message, exception, { dialogShown: true })
      showErrorDialog(uiMessage, '', dialogOptions)
    },
    [showErrorDialog],
  )

  useCameraSupport({
    // onUnsupported: disableScan,
    onSupported: requestPermission,
  })

  return (
    <Wrapper style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <Divider size={30} />
        {wcConnected ? (
          <ConnectedState
            cancelTx={cancelTx}
            chainPendingTxs={chainPendingTxs}
            session={wcSession}
            disconnect={wcDisconnect}
            switchChain={wcSwitchChain}
            explorer={first(wcChain?.explorers)?.url}
          />
        ) : isWCDialogShown === false ? (
          <View style={{ flexDirection: isMobile ? 'column' : 'column-reverse' }}>
            <ScanCode {...{ hasCameraAccess, styles, handleChange, handleError, qrDelay }} />
            <Divider size={30} />
            <PasteCode {...{ handleChange, handlePastePress, uri, setUri, styles }} />
          </View>
        ) : null}
      </ScrollView>
    </Wrapper>
  )
}

const styles = ({ theme }) => ({
  wrapper: {
    flex: 1,
    padding: 0,
  },
  container: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: '5%',
  },
  connectButton: {
    color: theme.colors.primary,
    fontWeight: 'normal',
    fontSize: normalize(15),
    textDecorationLine: 'underline',
  },
})

const WalletConnect = withStyles(styles)(WalletConnectScan)

WalletConnect.navigationOptions = {
  title: TITLE,
}

export default WalletConnect
