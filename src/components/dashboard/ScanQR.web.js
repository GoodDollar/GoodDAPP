import React from 'react'
import { StyleSheet } from 'react-native'
import QrReader from 'react-qr-reader'

import { NETWORK_ID } from '../../lib/constants/network'
import logger from '../../lib/logger/pino-logger'
import { readCode } from '../../lib/share'
import { Section, TopBar, Wrapper } from '../common'

const log = logger.child({ from: 'ScanQR.web' })

const ScanQR = ({ screenProps }) => {
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

        screenProps.push('SendLinkSummary', { to: address, amount })
      } catch (e) {
        log.error({ e })
      }
    }
  }

  const handleError = err => {
    log.error({ err })
  }

  return (
    <Wrapper>
      <TopBar hideBalance={true} />
      <Section style={styles.bottomSection}>
        <Section.Row>
          <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: '100%' }} />
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

ScanQR.navigationOptions = {
  title: 'Scan QR Code'
}

export default ScanQR
