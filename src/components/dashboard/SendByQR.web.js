// @flow
import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import QrReader from 'react-qr-reader'

import logger from '../../lib/logger/pino-logger'
import { extractQueryParams, readCode } from '../../lib/share'
import SimpleStore from '../../lib/undux/SimpleStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import usePermissions from '../permissions/hooks/usePermissions'
import { Permissions } from '../permissions/types'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { fireEvent, QR_SCAN } from '../../lib/analytics/analytics'
import { routeAndPathForCode } from './utils/routeAndPathForCode'
import QRCameraPermissionDialog from './SendRecieveQRCameraPermissionDialog'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'SendByQR.web' })

type Props = {
  screenProps: any,
}

const SendByQR = ({ screenProps }: Props) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()

  // check camera permission and show dialog if not allowed
  const hasCameraAccess = usePermissions(Permissions.Camera, {
    promptPopup: QRCameraPermissionDialog,
  })

  const onDismissDialog = () => setQRDelay(QR_DEFAULT_DELAY)

  const handleScan = async data => {
    if (data) {
      try {
        const decoded = decodeURI(data)
        let paramsUrl = extractQueryParams(decoded)
        const code = readCode(paramsUrl.code)
        log.info({ code })

        const { route, params } = await routeAndPathForCode('sendByQR', code)
        fireEvent(QR_SCAN, { type: 'send' })
        screenProps.push(route, params)
      } catch (e) {
        log.error('scan send code failed', e.message, e, { data })
        setQRDelay(false)
        throw e
      }
    }
  }

  const handleError = useCallback(
    exception => {
      const dialogOptions = { title: 'QR code scan failed' }
      const { name, message } = exception
      let errorMessage = message

      if ('NotAllowedError' === name) {
        // exit the function and do nothing as we already displayed error popup via usePermission hook
        return
      }

      showErrorDialog(errorMessage, '', dialogOptions)
      log.error('QR scan send failed', message, exception)
    },
    [screenProps, showErrorDialog]
  )

  return (
    <Wrapper>
      <TopBar hideBalance={true} hideProfile={false} profileAsLink={false} push={screenProps.push}>
        <View />
      </TopBar>
      <Section style={styles.bottomSection}>
        <Section.Row>
          {hasCameraAccess ? (
            <QrReader
              delay={qrDelay}
              onError={handleError}
              onScan={wrapFunction(handleScan, store, { onDismiss: onDismissDialog })}
              style={{ width: '100%' }}
            />
          ) : (
            <Text>show light gray (disabled-style) placeholder with camera icon here</Text>
          )}
        </Section.Row>
      </Section>
    </Wrapper>
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

SendByQR.navigationOptions = {
  title: 'Scan QR Code',
}

export default SendByQR
