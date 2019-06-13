// @flow
import QRCode from 'qrcode.react'
import React, { useMemo } from 'react'
import { View } from 'react-native'

import { useSetClipboard } from '../../lib/utils/Clipboard'
import { generateCode, generateShareLink } from '../../lib/share'
import { useDialog } from '../../lib/undux/utils/dialog'
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

const RECEIVE_TITLE = 'Receive G$'

const Receive = ({ screenProps }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [showDialogWithData] = useDialog()
  const setClipboard = useSetClipboard()
  const amount = 0

  const code = useMemo(() => generateCode(account, networkId, amount), [account, networkId, amount])
  const link = useMemo(() => {
    try {
      return generateShareLink('receive', { code })
    } catch (e) {
      showDialogWithData({
        title: 'Error',
        message: e.message
      })
    }
  }, [code])

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
            <Section.Text style={styles.secondaryText}>Your G$ wallet address:</Section.Text>
            <Section.Title style={styles.address}>
              <Address value={account} />
            </Section.Title>
            <Section.Text style={styles.secondaryText} onPress={() => setClipboard(account)}>
              Copy address to clipboard
            </Section.Text>
          </View>
          <ShareLink link={link} style={styles.shareQRButton}>
            Share your wallet link
          </ShareLink>
        </Section.Row>
      </Section>
      <PushButton
        mode="outlined"
        dark={false}
        routeName="Amount"
        screenProps={screenProps}
        style={styles.fullWidth}
        params={{ nextRoutes: ['ReceiveAmount'], params: { toReceive: true } }}
      >
        Generate detailed request
      </PushButton>
    </Wrapper>
  )
}

Receive.navigationOptions = {
  title: RECEIVE_TITLE
}

export default Receive
