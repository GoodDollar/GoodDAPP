import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import QrReader from 'react-qr-reader'

import logger from '../../lib/logger/pino-logger'
import { extractQueryParams, readReceiveLink } from '../../lib/share'
import SimpleStore from '../../lib/undux/SimpleStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'

const QR_DEFAULT_DELAY = 300

const log = logger.child({ from: 'ReceiveByQR.web' })

const ReceiveByQR = ({ screenProps }) => {
  const [qrDelay, setQRDelay] = useState(QR_DEFAULT_DELAY)
  const [withdrawParams, setWithdrawParams] = useState({ receiveLink: '', reason: '' })
  const store = SimpleStore.useStore()
  const [showErrorDialog] = useErrorDialog()

  const onDismissDialog = () => setQRDelay(QR_DEFAULT_DELAY)

  const handleScan = data => {
    if (data) {
      setQRDelay(false)

      try {
        const url = readReceiveLink(data)

        log.debug({ url })

        if (url === null) {
          showErrorDialog('Invalid QR Code. Probably this QR code is for sending GD')
        } else {
          const { receiveLink, reason } = extractQueryParams(url)

          if (!receiveLink) {
            showErrorDialog('Invalid QR Code. Probably this QR code is for sending GD')
          }

          setWithdrawParams({ receiveLink, reason })
        }
      } catch (e) {
        log.error(e.message, e)
        setQRDelay(false)
        throw e
      }
    }
  }

  const runWithdraw = async () => {
    if (withdrawParams.receiveLink) {
      try {
        const receipt = await executeWithdraw(store, withdrawParams.receiveLink)
        screenProps.navigateTo('Home', {
          event: receipt.transactionHash,
          receiveLink: undefined,
          reason: undefined,
        })
      } catch (e) {
        showErrorDialog(e)
      }
    }
  }

  useEffect(() => {
    runWithdraw()
  }, [withdrawParams])

  const handleError = e => {
    log.error(e.message, e)
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
    </>
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
