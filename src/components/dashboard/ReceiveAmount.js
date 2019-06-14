// @flow
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import QRCode from 'qrcode.react'
import { isMobile } from 'mobile-device-detect'
import { useDialog } from '../../lib/undux/utils/dialog'

import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode, generateReceiveShareObject } from '../../lib/share'
import GDStore from '../../lib/undux/GDStore'
import { useSetClipboard } from '../../lib/utils/Clipboard'
import { BigGoodDollar, CustomButton, Section, Wrapper } from '../common'
import { DoneButton, useScreenState } from '../appNavigation/stackNavigation'
import { receiveStyles as styles } from './styles'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive G$'

const ReceiveAmount = ({ screenProps }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [screenState] = useScreenState(screenProps)
  const [showDialogWithData] = useDialog()
  const store = GDStore.useStore()
  const setClipboard = useSetClipboard()
  const { amount, reason } = screenState

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
      Share link
    </CustomButton>
  )

  return (
    <Wrapper style={styles.wrapper}>
      <Section style={styles.section}>
        <Section.Row style={[styles.sectionRow, { justifyContent: 'space-evenly' }]}>
          <View style={styles.qrCode}>
            <QRCode value={code} />
          </View>
          <View>
            <Section.Text style={[styles.lowerSecondaryText]}>This QR code requests exactly</Section.Text>
            <Section.Text style={styles.addressSection}>
              <Text style={styles.url}>{share.url}</Text>
            </Section.Text>
            <Section.Text style={styles.secondaryText} onPress={() => setClipboard(share.url)}>
              Copy to clipboard
            </Section.Text>
            <Section.Text>
              <BigGoodDollar style={styles.centered} number={amount} />
            </Section.Text>
            <Section.Text>{reason ? reason : null}</Section.Text>
          </View>
        </Section.Row>
      </Section>
      {/* <ShareQR>Share QR Code</ShareQR>
      <DoneButton style={styles.doneButton} screenProps={screenProps} /> */}
      {isMobile && navigator.share ? <ShareButton style={styles.shareButton} /> : null}
      <DoneButton style={styles.buttonStyle} screenProps={screenProps} />
    </Wrapper>
  )
}

ReceiveAmount.navigationOptions = {
  title: RECEIVE_TITLE
}

ReceiveAmount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.nextRoutes && screenState.amount
}

export default ReceiveAmount
