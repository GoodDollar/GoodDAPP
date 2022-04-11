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

import usePermissions from '../permissions/hooks/usePermissions'
import useCameraSupport from '../browserSupport/hooks/useCameraSupport'

import SimpleStore from '../../lib/undux/SimpleStore'
import readWalletConnectUri from '../../lib/walletconnect'
import logger from '../../lib/logger/js-logger'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { decorate, ExceptionCode } from '../../lib/exceptions/utils'
import normalize from '../../lib/utils/normalizeText'

const log = logger.child({ from: 'walletConnect' })

const TITLE = `WalletConnect`

type WalletConnectProps = {
  styles: {},
  theme: {},
  screenProps: any,
}

const Divider = ({ size = 50 }) => <Section.Separator color="transparent" width={size} style={{ zIndex: -10 }} />

const WalletConnect = ({ screenProps, styles, theme }: WalletConnectProps) => {
  const [uri, setUri] = useState('')
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const { pop, navigateTo } = screenProps

  // check camera permission and show dialog if not allowed
  const handlePermissionDenied = useCallback(() => pop(), [pop])
  const [hasCameraAccess, requestPermission] = usePermissions(Permissions.Camera, {
    requestOnMounted: false,
    promptPopup: QRCameraPermissionDialog,
    onDenied: handlePermissionDenied,
    navigate: navigateTo,
  })

  // first of all check browser compatibility
  // if not compatible - then redirect to home
  const navigateToHome = useCallback(() => navigateTo('Home'), [navigateTo])

  const handleChange = data => {
    if (data) {
      try {
        logger.debug(data)
        const uri = readWalletConnectUri(data)

        log.debug({ uri })

        if (uri === null) {
          throw new Error('Invalid QR Code.')
        } else {
          store.set('walletConnect')({ uri })
        }
      } catch (e) {
        log.error('scan received failed', e.message, e)
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
    onUnsupported: navigateToHome,
    onSupported: requestPermission,
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
        {hasCameraAccess && (
          <QrReader
            delay={1000}
            onError={handleError}
            onScan={e => {
              handleChange(e.data)
            }}
            style={{ width: '100%' }}
          />
        )}
        <Divider size={30} />
        <Section.Text fontSize={15} fontWeight="medium" fontFamily="Roboto" color="black">
          {t`Or input code`}
        </Section.Text>
        <Divider size={30} />
        <InputText
          onSelectionChange={handleChange}
          value={uri}
          onChangeText={e => setUri(e)}
          placeholder="wc:1234123jakljasdkjasfd..."
        />
        <CustomButton onPress={screenProps.connectButton}>{t`Connect`}</CustomButton>
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

const walletConnect = withStyles(styles)(WalletConnect)

walletConnect.navigationOptions = {
  title: TITLE,
}

export default walletConnect
