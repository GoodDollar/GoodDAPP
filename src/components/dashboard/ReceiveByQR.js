import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import logger from '../../lib/logger/pino-logger'
import { extractQueryParams, readReceiveLink } from '../../lib/share'
import GDStore from '../../lib/undux/GDStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { Section, TopBar, Wrapper } from '../common'
import Withdraw from './Withdraw'

const log = logger.child({ from: 'ReceiveByQR.web' })

const ReceiveByQR = ({ screenProps }) => {
  const [withdrawParams, setWithdrawParams] = useState({ receiveLink: '', reason: '' })
  const store = GDStore.useStore()

  const handleScan = async data => {
    if (data) {
      try {
        const url = readReceiveLink(data)

        log.debug({ url })

        if (url === null) {
          throw new Error('Invalid QR Code.')
        } else {
          const { receiveLink, reason } = extractQueryParams(url)

          if (!receiveLink) {
            throw new Error('No receiveLink available')
          }

          setWithdrawParams({ receiveLink, reason })
        }
      } catch (e) {
        log.error({ e })
        throw e
      }
    }
  }
  return (
    <>
      <Wrapper>
        <TopBar hideBalance={true} push={screenProps.push} />
        <Section style={styles.bottomSection}>
          <Section.Row>
            <QRCodeScanner onRead={wrapFunction(handleScan, store)} />
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

ReceiveByQR.navigationOptions = {
  title: 'Scan QR Code'
}

export default ReceiveByQR
