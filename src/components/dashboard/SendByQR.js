// @flow

// libraries
import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { isAddress } from 'web3-utils'
import { noop } from 'lodash'

// components
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'

// hooks
import usePermissions from '../permissions/hooks/usePermissions'
import useCameraSupport from '../browserSupport/hooks/useCameraSupport'
import { useDialog } from '../../lib/dialog/useDialog'

// utils
import logger from '../../lib/logger/js-logger'
import { decorate, ExceptionCode } from '../../lib/exceptions/utils'
import { readCode } from '../../lib/share'
import { extractQueryParams } from '../../lib/utils/uri'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { Permissions } from '../permissions/types'
import { fireEvent, QR_SCAN } from '../../lib/analytics/analytics'
import { InfoIcon } from '../common/modal/InfoIcon'
import ExplanationDialog from '../common/dialogs/ExplanationDialog'
import { useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { extractEthAddress } from '../../lib/wallet/utils'
import QrReader from './QR/QRScanner'
import QRCameraPermissionDialog from './SendRecieveQRCameraPermissionDialog'
import { routeAndPathForCode } from './utils/routeAndPathForCode'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'SendByQR' })

type Props = {
  screenProps: any,
}

const RecipientWarnDialog = ({ onConfirm }) => (
  <ExplanationDialog
    title={'Make sure your recipient is also using the Fuse network'}
    image={InfoIcon}
    imageHeight={124}
    buttons={[
      { text: 'Cancel', onPress: noop, mode: 'text' },
      {
        text: 'Confirm',
        action: onConfirm,
      },
    ]}
  />
)

const SendByQR = ({ screenProps }: Props) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const { showDialog, showErrorDialog } = useDialog()
  const goodWallet = useWallet()
  const userStorage = useUserStorage()

  const { pop, push, navigateTo } = screenProps

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

  const onDismissDialog = () => setQRDelay(QR_DEFAULT_DELAY)

  const gotoSend = useCallback(
    async code => {
      const { route, params } = await routeAndPathForCode('sendByQR', code, goodWallet, userStorage)
      log.info({ code })
      fireEvent(QR_SCAN, { type: 'send' })
      push(route, params)
    },
    [push, goodWallet],
  )
  const handleScan = useCallback(
    async data => {
      if (data) {
        let code
        try {
          const decoded = decodeURI(data)
          const address = extractEthAddress(decoded)

          //check if data is already a wallet address
          if (isAddress(address)) {
            //this address was already used on fuse, so it is ok
            if (await goodWallet.isKnownFuseAddress(address)) {
              code = { address, networkId: goodWallet.networkId }
            } else {
              return showDialog({
                showButtons: false,
                onDismiss: noop,
                content: (
                  <RecipientWarnDialog
                    onConfirm={() => gotoSend({ address: address, networkId: goodWallet.networkId })}
                  />
                ),
              })
            }
          } else {
            const paramsUrl = extractQueryParams(decoded)
            code = readCode(paramsUrl.code)
          }

          gotoSend(code)
        } catch (e) {
          log.error('scan send code failed', e.message, e, { data })
          setQRDelay(false)

          throw e
        }
      }
    },
    [push, setQRDelay, gotoSend, goodWallet],
  )

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
    <Wrapper>
      <TopBar hideBalance={true} hideProfile={false} profileAsLink={false} push={push}>
        <View />
      </TopBar>
      <Section grow style={styles.bottomSection}>
        {hasCameraAccess && (
          <QrReader
            delay={qrDelay}
            onError={handleError}
            onScan={wrapFunction(handleScan, { onDismiss: onDismissDialog })}
          />
        )}
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  bottomSection: {
    flex: 1,
  },
})

SendByQR.navigationOptions = {
  title: 'Scan QR Code',
}

export default SendByQR
