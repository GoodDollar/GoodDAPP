// @flow
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import QRCode from 'qrcode.react'

import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode } from '../../lib/share'
import { Section, Wrapper, BigGoodDollar } from '../common'
import { receiveStyles as styles } from './styles'
import ShareQR from './ShareQR'
import { useScreenState } from '../appNavigation/stackNavigation'
import { weiToMask } from '../../lib/wallet/utils'
export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'

const ReceiveAmount = ({ screenProps, navigation }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { amount } = screenState

  const code = useMemo(() => generateCode(account, networkId, amount), [account, networkId, amount])

  return (
    <Wrapper style={styles.wrapper}>
      <Section style={styles.section}>
        <Section.Row style={[styles.sectionRow, { justifyContent: 'space-evenly' }]}>
          <View style={styles.qrCode}>
            <QRCode value={code} />
          </View>
          <View>
            <Section.Text style={styles.secondaryText}>This QR code requests exactly</Section.Text>
            <Section.Text>
              <BigGoodDollar style={styles.centered} number={amount} />
            </Section.Text>
          </View>
        </Section.Row>
      </Section>
      <ShareQR>Share QR Code</ShareQR>
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
