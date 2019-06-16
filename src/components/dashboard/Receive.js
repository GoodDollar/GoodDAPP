// @flow
import QRCode from 'qrcode.react'
import React, { useMemo } from 'react'
import { View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import { useSetClipboard } from '../../lib/utils/Clipboard'
import { generateCode, generateReceiveShareObject } from '../../lib/share'
import GDStore from '../../lib/undux/GDStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import { PushButton } from '../appNavigation/stackNavigation'
import { Address, CustomButton, Section, Wrapper } from '../common'
import ScanQRButton from '../common/ScanQRButton'
import TopBar from '../common/TopBar'
import { receiveStyles as styles } from './styles'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive G$'

const Receive = ({ screenProps }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [showDialogWithData] = useDialog()
  const store = GDStore.useStore()
  const setClipboard = useSetClipboard()
  const amount = 0
  const reason = ''

  const code = useMemo(() => generateCode(account, networkId, amount, reason), [account, networkId, amount, reason])
  const share = useMemo(() => {
    try {
      return generateReceiveShareObject(code)
    } catch (e) {
      showDialogWithData({
        title: 'Error',
        message: e.message
      })
    }
  }, [code])

  const shareAction = async () => {
    try {
      await navigator.share(share)
    } catch (e) {
      store.set('currentScreen')({
        dialogData: {
          visible: true,
          title: 'Error',
          message:
            'There was a problem triggering share action. You can still copy the link in tapping on "Copy link to clipboard"',
          dismissText: 'Ok'
        }
      })
    }
  }

  const ShareButton = () => (
    <CustomButton style={styles.buttonStyle} onPress={shareAction} mode="contained">
      Share your wallet link
    </CustomButton>
  )

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
          {isMobile && navigator.share ? <ShareButton style={styles.shareButton} /> : null}
        </Section.Row>
      </Section>
      <PushButton
        mode="outlined"
        dark={false}
        routeName="Amount"
        screenProps={screenProps}
        style={styles.fullWidth}
        params={{ nextRoutes: ['Reason', 'ReceiveAmount'], params: { toReceive: true } }}
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
