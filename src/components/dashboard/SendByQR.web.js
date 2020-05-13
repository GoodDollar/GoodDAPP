// @flow
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import QrReader from 'react-qr-reader'

import logger from '../../lib/logger/pino-logger'
import { extractQueryParams, readCode } from '../../lib/share'
import SimpleStore from '../../lib/undux/SimpleStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { fireEvent, QR_SCAN } from '../../lib/analytics/analytics'
import { routeAndPathForCode } from './utils/routeAndPathForCode'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'SendByQR.web' })

type Props = {
  screenProps: any,
}

const SendByQR = ({ screenProps }: Props) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()

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

  const handleError = e => {
    switch (e.name) {
      case 'NotAllowedError':
        showErrorDialog({
          visible: true,
          message: `GoodDollar can't access your camera, please enable camera permission`,
          dismissText: 'OK',
        })
        log.warn('QR scan send failed', e.message, e)
        break
      default:
        log.error('QR scan send failed', e.message, e)
        break
    }
  }

  return (
    <Wrapper>
      <TopBar hideBalance={true} hideProfile={false} profileAsLink={false} push={screenProps.push}>
        <View />
      </TopBar>
      <Section style={styles.bottomSection}>
        <Section.Row>
          <QrReader
            delay={qrDelay}
            onError={handleError}
            onScan={wrapFunction(handleScan, store, { onDismiss: onDismissDialog })}
            style={{ width: '100%' }}
          />
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
