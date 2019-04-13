import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import QrReader from 'react-qr-reader'

import { NETWORK_ID } from '../../lib/constants/network'
import logger from '../../lib/logger/pino-logger'
import { extractQueryParams, readCode, readReceiveLink } from '../../lib/share'
import GDStore from '../../lib/undux/GDStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { Section, TopBar, Wrapper } from '../common'
import Withdraw from './Withdraw'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'ScanQR.web' })

const ScanQR = ({ screenProps }) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const [withdrawParams, setWithdrawParams] = useState({ receiveLink: '', reason: '' })
  const store = GDStore.useStore()

  const onDismissDialog = () => setQRDelay(QR_DEFAULT_DELAY)

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
        setQRDelay(false)
        throw e
      }
    }
  }

  const handleError = err => {
    log.error({ err })
  }

  return (
    <>
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
      {withdrawParams.receiveLink ? <Withdraw params={withdrawParams} onSuccess={screenProps.pop} /> : null}
    </>
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
