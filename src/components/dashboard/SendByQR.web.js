import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import QrReader from 'react-qr-reader'

import { NETWORK_ID } from '../../lib/constants/network'
import logger from '../../lib/logger/pino-logger'
import { readCode } from '../../lib/share'
import GDStore from '../../lib/undux/GDStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { Section, TopBar, Wrapper } from '../common'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'SendByQR.web' })

const SendByQR = ({ screenProps }) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const store = GDStore.useStore()

  const onDismissDialog = () => setQRDelay(QR_DEFAULT_DELAY)

  const handleScan = async data => {
    if (data) {
      try {
        const code = readCode(data)

        log.info({ code })

        if (code === null) {
          throw new Error('Invalid QR Code.')
        }

        const { networkId, address, amount } = code

        if (networkId !== NETWORK_ID.FUSE) {
          throw new Error('Invalid network. Switch to Fuse.')
        }

        if (!amount) {
          screenProps.push('Amount', { to: address, nextRoutes: ['Reason', 'SendQRSummary'] })
        } else {
          screenProps.push('SendQRSummary', { to: address, amount, reason: 'From QR with Amount' })
        }
      } catch (e) {
        log.error({ e })
        setQRDelay(false)
        throw e
      }
    }
  }

  const handleError = err => {
    log.error({ err })
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
    alignItems: 'baseline'
  },
  bottomSection: {
    flex: 1
  }
})

SendByQR.navigationOptions = {
  title: 'Scan QR Code'
}

export default SendByQR
