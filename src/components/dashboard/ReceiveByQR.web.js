import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import QrReader from 'react-qr-reader'

import logger, { ExceptionCategory } from '../../lib/logger/pino-logger'
import { extractQueryParams, readReceiveLink } from '../../lib/share'
import SimpleStore from '../../lib/undux/SimpleStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import usePermissions from '../permissions/hooks/usePermissions'
import { Permissions } from '../permissions/types'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { fireEvent, QR_SCAN } from '../../lib/analytics/analytics'
import QRCameraPermissionDialog from './SendRecieveQRCameraPermissionDialog'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'ReceiveByQR.web' })

const ReceiveByQR = ({ screenProps }) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const [withdrawParams, setWithdrawParams] = useState({ receiveLink: '', reason: '' })
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()
  const { navigateTo, push } = screenProps

  const handlePermissionDenied = useCallback(() => navigateTo('Receive'), [navigateTo])

  // check camera permission and show dialog if not allowed
  const hasCameraAccess = usePermissions(Permissions.Camera, {
    promptPopup: QRCameraPermissionDialog,
    onDenied: handlePermissionDenied,
  })

  const onDismissDialog = () => setQRDelay(QR_DEFAULT_DELAY)

  const handleScan = data => {
    if (data) {
      setQRDelay(false)

      try {
        const url = readReceiveLink(data)

        log.debug({ url })

        if (url === null) {
          log.error('Invalid QR Code. Probably this QR code is for sending GD', '', null, {
            url,
            category: ExceptionCategory.Human,
          })
          showErrorDialog('Invalid QR Code. Probably this QR code is for sending GD')
        } else {
          const { receiveLink, reason } = extractQueryParams(url)

          if (!receiveLink) {
            log.error('Invalid QR Code. Probably this QR code is for sending GD', '', null, {
              url,
              receiveLink,
              reason,
              category: ExceptionCategory.Human,
            })
            showErrorDialog('Invalid QR Code. Probably this QR code is for sending GD')
          }
          fireEvent(QR_SCAN, { type: 'receive' })
          setWithdrawParams({ receiveLink, reason })
        }
      } catch (e) {
        log.error('scan receive failed', e.message, e, { dialogShown: false })
        setQRDelay(false)
        throw e
      }
    }
  }

  const runWithdraw = useCallback(async () => {
    const { receiveLink } = withdrawParams

    if (receiveLink) {
      try {
        const receipt = await executeWithdraw(store, receiveLink)
        navigateTo('Home', {
          event: receipt.transactionHash,
          receiveLink: undefined,
          reason: undefined,
        })
      } catch (e) {
        log.error('Executing withdraw failed', e.message, e, {
          receiveLink,
        })
        showErrorDialog('Something has gone wrong. Please try again later.')
      }
    }
  }, [navigateTo, withdrawParams, store, showErrorDialog])

  useEffect(() => {
    runWithdraw()
  }, [withdrawParams])

  const handleError = useCallback(
    exception => {
      const dialogOptions = { title: 'QR code scan failed' }
      const { name, message } = exception
      let errorMessage = message

      if ('NotAllowedError' === name) {
        // exit the function and do nothing as we already displayed error popup via usePermission hook
        return
      }

      log.error('QR scan receive failed', message, exception)
      showErrorDialog(errorMessage, '', dialogOptions)
    },
    [showErrorDialog]
  )

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
                onScan={wrapFunction(handleScan, store, { onDismiss: onDismissDialog })}
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
