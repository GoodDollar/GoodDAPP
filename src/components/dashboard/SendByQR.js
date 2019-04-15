import React from 'react'
import { StyleSheet } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import { NETWORK_ID } from '../../lib/constants/network'
import logger from '../../lib/logger/pino-logger'
import { readCode } from '../../lib/share'
import GDStore from '../../lib/undux/GDStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { Section, TopBar, Wrapper } from '../common'

const log = logger.child({ from: 'SendByQR.web' })

const SendByQR = ({ screenProps }) => {
  const store = GDStore.useStore()

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
        throw e
      }
    }
  }

  return (
    <Wrapper>
      <TopBar hideBalance={true} push={screenProps.push} />
      <Section style={styles.bottomSection}>
        <Section.Row>
          <QRCodeScanner onRead={wrapFunction(handleScan, store)} />
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
