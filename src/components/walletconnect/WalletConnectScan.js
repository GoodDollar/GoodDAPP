// @flow
import React, { useCallback, useState } from 'react'
import { ScrollView } from 'react-native'
import { t } from '@lingui/macro'

// components
import Wrapper from '../common/layout/Wrapper'
import { CustomButton, Section } from '../common'
import InputText from '../common/form/InputText'
import { withStyles } from '../../lib/styles'
import QrReader from '../dashboard/QR/QRScanner'
import QRCameraPermissionDialog from '../dashboard/SendRecieveQRCameraPermissionDialog'

// hooks
import usePermissions from '../permissions/hooks/usePermissions'
import useCameraSupport from '../browserSupport/hooks/useCameraSupport'

// utils
import logger from '../../lib/logger/js-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/exceptions/utils'
import { useDialog } from '../../lib/dialog/useDialog'
import normalize from '../../lib/utils/normalizeText'
import { readWalletConnectUri, useWalletConnectSession } from '../../lib/wallet/WalletConnectClient'

const log = logger.child({ from: 'WalletConnectScan' })

const TITLE = `WalletConnect`

const QR_DEFAULT_DELAY = 300

type WalletConnectProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const Divider = ({ size = 50 }) => <Section.Separator color="transparent" width={size} style={{ zIndex: -10 }} />

const WalletConnectScan = ({ screenProps, styles, theme }: WalletConnectProps) => {
  const [qrDelay, setQrDelay] = useState(QR_DEFAULT_DELAY)
  const setWalletConnectUri = useWalletConnectSession()
  const [uri, setUri] = useState('')
  const [enableScan, setEnableScan] = useState(true)
  const { showErrorDialog } = useDialog()
  const { pop, navigateTo } = screenProps

  // check camera permission and show dialog if not allowed
  const handlePermissionDenied = useCallback(() => pop(), [pop])
  const [hasCameraAccess, requestPermission] = usePermissions(Permissions.Camera, {
    requestOnMounted: false,
    promptPopup: QRCameraPermissionDialog,
    onDenied: handlePermissionDenied,
    navigate: navigateTo,
  })

  // check browser compatibility with scanning
  // if not compatible - then hide scanner
  const disableScan = useCallback(() => setEnableScan(false))
  const startScan = useCallback(() => {
    setEnableScan(true)
    requestPermission()
  })

  const handleChange = data => {
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
  }

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
    onUnsupported: disableScan,
    onSupported: startScan,
  })

  return (
    <Wrapper style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <Divider size={30} />
        <Section.Text fontSize={28} fontWeight="bold" fontFamily={theme.fonts.slab} color="black">
          {t`WalletConnect`}
        </Section.Text>
        <Divider size={10} />
        <Section.Text fontSize={15} fontWeight="medium" fontFamily="Roboto" color="black">
          {t`Scan Code`}
        </Section.Text>
        <Divider size={30} />
        {hasCameraAccess && enableScan && (
          <>
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
          </>
        )}
        <Section.Text fontSize={15} fontWeight="medium" fontFamily="Roboto" color="black">
          {t`Or input code`}
        </Section.Text>
        <Divider size={30} />
        <InputText value={uri} onChangeText={setUri} placeholder="wc:1234123jakljasdkjasfd..." />
        <CustomButton onPress={() => handleChange(uri)} style={[styles.connectButton]}>{t`Connect`}</CustomButton>
        <Divider size={30} />
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
