import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import QrReader from 'react-qr-reader'

import { NETWORK_ID } from '../../lib/constants/network'
import logger from '../../lib/logger/pino-logger'
import { readCode } from '../../lib/share'
import { CustomDialog, Section, TopBar, Wrapper } from '../common'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'ScanQR.web' })

const ScanQR = ({ screenProps }) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const [dialogData, setDialogData] = useState({ visible: false })

  const dismissDialog = () => {
    setDialogData({ visible: false })
    setQRDelay(QR_DEFAULT_DELAY)
  }

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
        setDialogData({ visible: true, title: 'Error', message: e.message })
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
          <QrReader delay={qrDelay} onError={handleError} onScan={handleScan} style={{ width: '100%' }} />
        </Section.Row>
      </Section>
      <CustomDialog onDismiss={dismissDialog} {...dialogData} />
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
