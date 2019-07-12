// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import QRCodeScanner from 'react-native-qrcode-scanner'

import logger from '../../lib/logger/pino-logger'
import { readCode } from '../../lib/share'
import SimpleStore from '../../lib/undux/SimpleStore'
import { wrapFunction } from '../../lib/undux/utils/wrapper'
import { Section, TopBar, Wrapper } from '../common'
import { routeAndPathForCode } from './utils/routeAndPathForCode'

const log = logger.child({ from: 'SendByQR.web' })

type Props = {
  screenProps: any,
}

const SendByQR = ({ screenProps }: Props) => {
  const store = SimpleStore.useStore()

  const handleScan = async data => {
    if (data) {
      try {
        const code = readCode(data)

        log.info({ code })

        const { route, params } = await routeAndPathForCode('sendByQR', code)

        screenProps.push(route, params)
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
