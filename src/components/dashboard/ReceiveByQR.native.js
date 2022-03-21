import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import logger from '../../lib/logger/js-logger'
import { readReceiveLink } from '../../lib/share'
import { extractQueryParams } from '../../lib/utils/uri'
import SimpleStore from '../../lib/undux/SimpleStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'

import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'

const log = logger.child({ from: 'ReceiveByQR' })

const ReceiveByQR = ({ screenProps }) => {
  const [withdrawParams, setWithdrawParams] = useState({ receiveLink: '', reason: '' })
  const goodWallet = useWallet()
  const userStorage = useUserStorage()

  const store = SimpleStore.useStore()

  const handleScan = data => {
    if (data) {
      try {
        log.debug('scan result:', data)
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
        log.error('scan received failed', e.message, e)
        throw e
      }
    }
  }

  const runWithdraw = async () => {
    if (withdrawParams.receiveLink) {
      const receipt = await executeWithdraw(
        store,
        withdrawParams.receiveLink,
        undefined,
        undefined,
        goodWallet,
        userStorage,
      )
      screenProps.navigateTo('Home', {
        event: receipt.transactionHash,
        receiveLink: undefined,
        reason: undefined,
      })
    }
  }

  useEffect(() => {
    runWithdraw()
  }, [withdrawParams, runWithdraw])

  return (
    <React.Fragment>
      <Wrapper>
        <TopBar hideBalance={true} push={screenProps.push} />
        <Section style={styles.bottomSection}>
          <Section.Row>
            <QRCodeScanner onRead={wrapFunction(handleScan, store)} />
          </Section.Row>
        </Section>
      </Wrapper>
    </React.Fragment>
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

ReceiveByQR.navigationOptions = {
  title: 'Scan QR Code',
}

export default ReceiveByQR
