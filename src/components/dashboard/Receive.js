// @flow
import React, { useCallback, useMemo } from 'react'
import { Clipboard, View } from 'react-native'
import QRCode from 'qrcode.react'

import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { generateCode } from '../../lib/share'
import { Address, Section, Wrapper } from '../common'
import { receiveStyles as styles } from './styles'
import { PushButton } from '../appNavigation/stackNavigation'
import TopBar from '../common/TopBar'
import ShareQR from './ShareQR'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'

const log = logger.child({ from: RECEIVE_TITLE })

const Receive = ({ screenProps }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const amount = 0

  const code = useMemo(() => generateCode(account, networkId, amount), [account, networkId, amount])

  const copyAddress = useCallback(() => {
    Clipboard.setString(account)
    log.info('Account address copied', { account })
  }, [account])

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar hideBalance={true} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.qrCode}>
            <QRCode value={code} />
          </View>
          <View style={styles.addressSection}>
            <Section.Text style={styles.secondaryText}>Your GD wallet address:</Section.Text>
            <Section.Title style={styles.address}>
              <Address value={account} />
            </Section.Title>
            <Section.Text style={styles.secondaryText} onPress={copyAddress}>
              Copy address to clipboard
            </Section.Text>
          </View>
          <PushButton mode="outlined" dark={false} routeName="Amount" screenProps={screenProps}>
            Request an amount
          </PushButton>
        </Section.Row>
      </Section>
      <ShareQR>Share address & QR code</ShareQR>
    </Wrapper>
  )
}

Receive.navigationOptions = {
  title: RECEIVE_TITLE
}

export default Receive
