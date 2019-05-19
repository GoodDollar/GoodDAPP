// @flow
import React, { useMemo } from 'react'
import { View } from 'react-native'
import QRCode from 'qrcode.react'
import { useDialog } from '../../lib/undux/utils/dialog'

import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode, generateShareLink } from '../../lib/share'
import { Section, Wrapper, BigGoodDollar } from '../common'
import { receiveStyles as styles } from './styles'
// import ShareQR from './ShareQR'
import ShareLink from './ShareLink'
import { DoneButton, useScreenState } from '../appNavigation/stackNavigation'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive G$'

const ReceiveAmount = ({ screenProps }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [screenState, setScreenState] = useScreenState(screenProps)
  const [showDialogWithData] = useDialog()
  const { amount } = screenState

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
      <Section style={styles.section}>
        <Section.Row style={[styles.sectionRow, { justifyContent: 'space-evenly' }]}>
          <View style={styles.qrCode}>
            <QRCode value={code} />
          </View>
          <View>
            <Section.Text style={[styles.lowerSecondaryText]}>This QR code requests exactly</Section.Text>
            <Section.Text>
              <BigGoodDollar style={styles.centered} number={amount} />
            </Section.Text>
          </View>
        </Section.Row>
      </Section>
      {/* <ShareQR>Share QR Code</ShareQR>
      <DoneButton style={styles.doneButton} screenProps={screenProps} /> */}
      <ShareLink link={link}>Share QR Code</ShareLink>
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
