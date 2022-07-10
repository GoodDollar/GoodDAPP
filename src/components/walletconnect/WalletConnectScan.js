// @flow
/* eslint-disable*/
import React, { useCallback, useMemo, useEffect, useState } from 'react'
import { Picker, ScrollView, View } from 'react-native'
import { t } from '@lingui/macro'
import { sortBy } from 'lodash'
// components
import Wrapper from '../common/layout/Wrapper'
import { CustomButton, Section, Image } from '../common'
import InputText from '../common/form/InputText'
import InputWithAdornment from '../common/form/InputWithAdornment'

import { withStyles } from '../../lib/styles'
import { isMobile } from '../../lib/utils/platform'
import QrReader from '../dashboard/QR/QRScanner'
import QRCameraPermissionDialog from '../dashboard/SendRecieveQRCameraPermissionDialog'
import Icon from '../common/view/Icon'

// hooks
import usePermissions from '../permissions/hooks/usePermissions'
import useCameraSupport from '../browserSupport/hooks/useCameraSupport'
import { useClipboardPaste } from '../../lib/hooks/useClipboard'

// utils
import logger from '../../lib/logger/js-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/exceptions/utils'
import { useDialog } from '../../lib/dialog/useDialog'
import normalize from '../../lib/utils/normalizeText'
import { readWalletConnectUri, useWalletConnectSession, useChainsList } from '../../lib/wallet/WalletConnectClient'
import { WcHeader } from './WalletConnectModals'

import wcExample from '../../assets/walletconnectExample.png'

const log = logger.child({ from: 'WalletConnectScan' })

const TITLE = `WalletConnect`

const QR_DEFAULT_DELAY = 300

type WalletConnectProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const Divider = ({ size = 50 }) => <Section.Separator color="transparent" width={size} style={{ zIndex: -10 }} />

const SwitchChain = ({ switchChain, chainId }) => {
  const [chain, setChain] = useState(chainId)
  const chains = useChainsList()

  return (
    <Section style={{ flexDirection: 'row', paddingHorizontal: 0 }}>
      <Section.Text textAlign={'start'} style={{ flex: 1 }}>
        Change Network:
      </Section.Text>
      <Picker
        style={{ flex: 2, width: '100%' }}
        selectedValue={chain}
        onValueChange={(itemValue, itemIndex) => {
          if (itemValue !== chain) {
            switchChain && switchChain(chains[itemIndex])
            setChain(itemValue)
          }
        }}
      >
        {chains.map(chain => (
          <Picker.Item label={chain.name} value={chain.chainId} key={chain.chainId} />
        ))}
      </Picker>
    </Section>
  )
}
const ConnectedState = ({ session, disconnect, switchChain }) => {
  return (
    <Section>
      <WcHeader session={session} />
      <SwitchChain switchChain={switchChain} chainId={session.chainId} />
      <CustomButton onPress={disconnect} color={'red'}>
        {t`Disconnect`}
      </CustomButton>
    </Section>
  )
}

const PasteCode = ({ handlePastePress, handleChange, setUri, uri, styles }) => (
  <View>
    <Section.Title fontWeight="medium">{t`Paste Code`}</Section.Title>
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1, gap: 12, marginRight: 12 }}>
        <Image source={wcExample} resizeMode={'contain'} style={{ width: '100%', height: 'auto' }} />
      </View>
      <View style={{ flex: 2, justifyContent: 'flex-end' }}>
        <View>
          {/* <View style={styles.pasteIcon}> */}
          <InputWithAdornment
            showAdornment={true}
            adornment="paste"
            adornmentSize={32}
            adornmentAction={handlePastePress}
            onChangeText={setUri}
            value={uri}
            placeholder="wc:1234123jakljasdkjasfd..."
          />
        </View>
        <CustomButton onPress={() => handleChange(uri)} style={[styles.connectButton]}>{t`Connect`}</CustomButton>
      </View>
    </View>
  </View>
)

const ScanCode = ({ hasCameraAccess, styles, handleChange, handleError, qrDelay }) => {
  if (!hasCameraAccess) {
    return null
  }
  return (
    <View>
      <Section.Title fontWeight="medium">{t`Scan Code`}</Section.Title>
      <QrReader
        delay={qrDelay}
        onError={handleError}
        onScan={e => {
          if (e) {
            handleChange(e)
          }
        }}
        style={{ width: '100%' }}
      />
      <Divider size={30} />
    </View>
  )
}

const WalletConnectScan = ({ screenProps, styles, theme }: WalletConnectProps) => {
  const [qrDelay, setQrDelay] = useState(QR_DEFAULT_DELAY)
  const {
    wcConnect: setWalletConnectUri,
    wcConnected,
    wcSession,
    wcDisconnect,
    wcSwitchChain,
  } = useWalletConnectSession()

  const [uri, setUri] = useState('')
  const { showErrorDialog } = useDialog()

  const { pop, navigateTo } = screenProps

  const handleChange = useCallback(
    data => {
      log.debug('handleChange:', { data })

      if (data) {
        setQrDelay(false)

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

  // check camera permission and show dialog if not allowed
  const handlePermissionDenied = useCallback(() => pop(), [pop])
  const [hasCameraAccess, requestPermission] = usePermissions(Permissions.Camera, {
    requestOnMounted: false,
    promptPopup: QRCameraPermissionDialog,
    onDenied: handlePermissionDenied,
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
          <ConnectedState session={wcSession} disconnect={wcDisconnect} switchChain={wcSwitchChain} />
        ) : (
          <View style={{ flexDirection: isMobile ? 'column' : 'column-reverse' }}>
            <ScanCode {...{ hasCameraAccess, styles, handleChange, handleError, qrDelay }} />
            <Divider size={30} />
            <PasteCode {...{ handleChange, handlePastePress, uri, setUri, styles }} />
          </View>
        )}
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
