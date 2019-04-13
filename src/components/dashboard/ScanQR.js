import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import { NETWORK_ID } from '../../lib/constants/network'
import logger from '../../lib/logger/pino-logger'
import { extractQueryParams, readCode, readReceiveLink } from '../../lib/share'
import { CustomDialog, Section, TopBar, Wrapper } from '../common'
import Withdraw from './Withdraw'

const log = logger.child({ from: 'ScanQR.web' })

const ScanQR = ({ screenProps }) => {
  const [dialogData, setDialogData] = useState({ visible: false })
  const [withdrawParams, setWithdrawParams] = useState({ receiveLink: '', reason: '' })

  const dismissDialog = () => {
    setDialogData({ visible: false })
  }

  const handleScan = async data => {
    if (data) {
      try {
        const code = readCode(data)

        log.info({ code })

        if (code === null) {
          const url = readReceiveLink(data)

          log.info({ url })

          if (url === null) {
            throw new Error('Invalid QR Code.')
          } else {
            const { receiveLink, reason } = extractQueryParams(url)
            setWithdrawParams({ receiveLink, reason })
          }
        } else {
          const { networkId, address, amount } = code

          if (networkId !== NETWORK_ID.FUSE) {
            throw new Error('Invalid network. Switch to Fuse.')
          }

          if (!amount) {
            screenProps.push('Amount', { to: address, nextRoutes: ['Reason', 'SendQRSummary'] })
          } else {
            // FIXME: nextRoute -> foo
            // It was added as a workaround to the restrictions in the SendQRSummary.shouldNavigateToComponent
            screenProps.push('SendQRSummary', {
              to: address,
              amount,
              reason: 'From QR with Amount',
              nextRoutes: ['foo']
            })
          }
        }
      } catch (e) {
        log.error({ e })
        setDialogData({ visible: true, title: 'Error', message: e.message })
      }
    }
  }

  return (
    <Wrapper>
      <TopBar hideBalance={true} push={screenProps.push} />
      <Section style={styles.bottomSection}>
        <Section.Row>
          <QRCodeScanner onRead={handleScan} />
        </Section.Row>
      </Section>
      <CustomDialog onDismiss={dismissDialog} {...dialogData} />
      {withdrawParams.receiveLink ? <Withdraw params={withdrawParams} onSuccess={screenProps.pop} /> : null}
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
