// @flow
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import QrReader from 'react-qr-reader'

import logger from '../../lib/logger/pino-logger'
import { readCode } from '../../lib/share'
import SimpleStore from '../../lib/undux/SimpleStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { routeAndPathForCode } from './utils/routeAndPathForCode'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'SendByQR.web' })

type Props = {
  screenProps: any,
}

const SendByQR = ({ screenProps }: Props) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const store = SimpleStore.useStore()

  const onDismissDialog = () => setQRDelay(QR_DEFAULT_DELAY)

  const handleScan = async data => {
    if (data) {
      try {
        const code = readCode(data)

        log.info({ code })

        const { route, params } = await routeAndPathForCode('sendByQR', code)

        screenProps.push(route, params)
      } catch (e) {
        log.error(e.message, e)
        setQRDelay(false)
        throw e
      }
    }
  }

  const handleError = e => {
    log.error(e.message, e)
  }

  return (
    <Wrapper>
      <TopBar hideBalance={true} push={screenProps.push} />
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
