// @flow
import QRCode from 'qrcode.react'
import React, { useCallback, useMemo } from 'react'
import { Clipboard, View } from 'react-native'

import logger from '../../lib/logger/pino-logger'
import { generateCode, generateShareLink } from '../../lib/share'
import goodWallet from '../../lib/wallet/GoodWallet'
import { PushButton } from '../appNavigation/stackNavigation'
import { Address, Section, Wrapper } from '../common'
import ScanQRButton from '../common/ScanQRButton'
import TopBar from '../common/TopBar'
import ShareLink from './ShareLink'
import { receiveStyles as styles } from './styles'

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
  const link = useMemo(() => generateShareLink('receive', { code }), [code])

  const copyAddress = useCallback(() => {
    Clipboard.setString(account)
    log.info('Account address copied', { account })
  }, [account])

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar hideBalance={false} push={screenProps.push}>
        <ScanQRButton onPress={() => screenProps.push('ReceiveByQR')} />
      </TopBar>
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
          <PushButton
            mode="outlined"
            dark={false}
            routeName="Amount"
            screenProps={screenProps}
            params={{ nextRoutes: ['ReceiveAmount'], params: { toReceive: true } }}
          >
            Request an amount
          </PushButton>
        </Section.Row>
      </Section>
      <ShareLink link={link}>Share address & QR code</ShareLink>
    </Wrapper>
  )
}

Receive.navigationOptions = {
  title: RECEIVE_TITLE
}

export default Receive
