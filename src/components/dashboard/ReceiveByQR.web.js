// libraries
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import QrReader from 'react-qr-reader-es6'

// components
import { t } from '@lingui/macro'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'

// hooks
import usePermissions from '../permissions/hooks/usePermissions'
import useCameraSupport from '../browserSupport/hooks/useCameraSupport'
import { useDialog } from '../../lib/dialog/useDialog'

// utils
import logger from '../../lib/logger/js-logger'
import { decorate, ExceptionCategory, ExceptionCode, wrapFunction } from '../../lib/exceptions/utils'
import { readReceiveLink } from '../../lib/share'
import { createUrlObject } from '../../lib/utils/uri'
import { executeWithdraw } from '../../lib/wallet/utils'
import { useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'

import { Permissions } from '../permissions/types'
import { fireEvent, QR_SCAN } from '../../lib/analytics/analytics'
import QRCameraPermissionDialog from './SendRecieveQRCameraPermissionDialog'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'ReceiveByQR.web' })

const ReceiveByQR = ({ screenProps }) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const [withdrawParams, setWithdrawParams] = useState({ receiveLink: '', reason: '' })
  const { showErrorDialog } = useDialog()
  const goodWallet = useWallet()
  const userStorage = useUserStorage()

  const { navigateTo, push } = screenProps

  // check camera permission and show dialog if not allowed
  const handlePermissionDenied = useCallback(() => navigateTo('Receive'), [navigateTo])
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

  const handleScan = data => {
    if (data) {
      setQRDelay(false)

      try {
        const url = readReceiveLink(data)

        log.debug({ url })

        if (url === null) {
          const error = new Error('Invalid QR Code. Probably this QR code is for sending GD')

          log.warn('Wrong QR code received', error.message, error, {
            url,
            category: ExceptionCategory.Human,
            dialogShown: true,
          })

          showErrorDialog(t`Invalid QR Code. Probably this QR code is for sending GD`)
        } else {
          const { params } = createUrlObject(url)
          const { receiveLink, reason } = params

          if (!receiveLink) {
            const error = new Error('Invalid QR Code. Probably this QR code is for sending GD')

            log.warn('Wrong QR code received', error.message, error, {
              url,
              receiveLink,
              reason,
              category: ExceptionCategory.Human,
              dialogShown: true,
            })

            showErrorDialog(t`Invalid QR Code. Probably this QR code is for sending GD`)
          }

          fireEvent(QR_SCAN, { type: 'receive' })
          setWithdrawParams({ receiveLink, reason })
        }
      } catch (e) {
        log.error('scan receive failed', e.message, e)
        setQRDelay(false)

        throw e
      }
    }
  }

  const runWithdraw = useCallback(async () => {
    const { receiveLink } = withdrawParams

    if (receiveLink) {
      try {
        const receipt = await executeWithdraw(receiveLink, undefined, undefined, goodWallet, userStorage)

        navigateTo('Home', {
          event: receipt.transactionHash,
          receiveLink: undefined,
          reason: undefined,
        })
      } catch (exception) {
        const { message } = exception
        const uiMessage = decorate(exception, ExceptionCode.E5)

        log.error('Executing withdraw failed', message, exception, {
          receiveLink,
          dialogShown: true,
        })

        showErrorDialog(uiMessage)
      }
    }
  }, [navigateTo, withdrawParams, showErrorDialog, goodWallet, userStorage])

  useEffect(() => {
    runWithdraw()
  }, [withdrawParams])

  const handleError = useCallback(
    exception => {
      const dialogOptions = { title: 'QR code scan failed' }
      const { name, message } = exception
      const uiMessage = decorate(exception, ExceptionCode.E6)

      if ('NotAllowedError' === name) {
        // exit the function and do nothing as we already displayed error popup via usePermission hook
        return
      }

      log.error('QR scan receive failed', message, exception, { dialogShown: true })
      showErrorDialog(uiMessage, '', dialogOptions)
    },
    [showErrorDialog],
  )

  useCameraSupport({
    onUnsupported: navigateToHome,
    onSupported: requestPermission,
  })

  return (
    <>
      <Wrapper>
        <TopBar hideBalance={true} hideProfile={false} profileAsLink={false} push={push}>
          <View />
        </TopBar>
        <Section style={styles.bottomSection}>
          <Section.Row>
            {hasCameraAccess && (
              <QrReader
                delay={qrDelay}
                onError={handleError}
                onScan={wrapFunction(handleScan, { onDismiss: onDismissDialog })}
                style={{ width: '100%' }}
              />
            )}
          </Section.Row>
        </Section>
      </Wrapper>
    </>
  )
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  bottomSection: {
    flex: 1,
  },
})

ReceiveByQR.navigationOptions = {
  title: 'Scan QR Code',
}

export default ReceiveByQR
