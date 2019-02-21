// @flow
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import QRCode from 'qrcode.react'

import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode } from '../../lib/share'
import { Section, Wrapper } from '../common'
import { fontStyle } from '../common/styles'
import { normalize } from 'react-native-elements'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'

const SendConfirmation = ({ screenProps, navigation }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const amount = navigation.getParam('amount', 0)
  const url = 'http://google.com'

  const code = useMemo(() => generateCode(account, networkId, amount), [account, networkId, amount])

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={[{}]}>
          <View style={styles.qrCode}>
            <QRCode value={code} />
          </View>
        </Section.Row>
        <Section.Row>
          <Section.Title>{url}</Section.Title>
        </Section.Row>
        <Section.Row>
          <Section.Text>COPY ADDRESS TO CLIPBOARD</Section.Text>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    //justifyContent: 'space-between',
    alignItems: 'center'
  },
  headline: {
    ...fontStyle,
    textTransform: 'uppercase',
    marginBottom: '1rem'
  },
  qrCode: {
    marginTop: '2rem',
    padding: '1rem',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: '4px'
  },
  addressSection: {
    marginBottom: '1rem'
  },
  address: {
    margin: '0.5rem'
  },
  secondaryText: {
    margin: '1rem',
    color: '#A2A2A2',
    textTransform: 'uppercase'
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'row',
    marginTop: '1rem'
  },
  inputField: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  amountInput: {
    backgroundColor: 'transparent'
  },
  amountLabel: {
    ...fontStyle,
    fontSize: normalize(32)
  },
  amountSymbol: {
    fontSize: normalize(12)
  }
})

SendConfirmation.navigationOptions = {
  title: RECEIVE_TITLE
}

export default SendConfirmation
