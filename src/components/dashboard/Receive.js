import React, { useCallback, useMemo, useState } from 'react'
import { Clipboard, StyleSheet, View, Text } from 'react-native'
import { Headline, TextInput } from 'react-native-paper'
import QRCode from 'qrcode.react'

import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { generateCode } from '../../lib/share'
import { Address, Avatar, CustomButton as Button, Section, Wrapper } from '../common'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { fontStyle } from '../common/styles'
import { normalize } from 'react-native-elements'

const RECEIVE_TITLE = 'Receive GD'

const log = logger.child({ from: RECEIVE_TITLE })

const TopBar = () => (
  <Section>
    <Section.Row>
      <Avatar />
    </Section.Row>
  </Section>
)

const GenerateCode = ({ screenProps, navigation }) => {
  const { account, networkId } = goodWallet
  const amount = navigation.getParam('amount', 0)

  const code = useMemo(() => generateCode(account, networkId, amount), [account, networkId, amount])

  if (!amount) {
    const copyAddress = useCallback(() => {
      Clipboard.setString(account)
      log.info('Account address copied', { account })
    }, [account])

    const showAmountDialog = useCallback(() => navigation.navigate('Amount'))

    return (
      <Wrapper style={styles.wrapper}>
        <TopBar />
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
            <Button mode="outlined" onPress={showAmountDialog}>
              Request an amount
            </Button>
          </Section.Row>
        </Section>
        <Button mode="contained" dark={true}>
          Share address & QR code
        </Button>
      </Wrapper>
    )
  } else {
    return (
      <Wrapper style={styles.wrapper}>
        <Section style={styles.section}>
          <Section.Row style={[styles.sectionRow, { justifyContent: 'space-evenly' }]}>
            <View style={styles.qrCode}>
              <QRCode value={code} />
            </View>

            <View>
              <Section.Text style={styles.secondaryText}>This QR code requests exactly</Section.Text>
              <Section.Title style={styles.amountLabel}>
                {amount}
                <Text style={styles.amountSymbol}>GD</Text>
              </Section.Title>
            </View>
          </Section.Row>
        </Section>
        <Button mode="contained" dark={true}>
          Share QR code
        </Button>
      </Wrapper>
    )
  }
}

GenerateCode.navigationOptions = {
  title: RECEIVE_TITLE
}

const AmountDialog = ({ screenProps, navigation }) => {
  const [amount, setAmount] = useState(0)

  const goBack = useCallback(() => navigation.navigate('Code'), [])

  const goNext = useCallback(() => navigation.navigate('Code', { amount }), [amount])

  const handleAmountChange = useCallback(value => {
    const amount = parseInt(value)
    setAmount(amount)
  }, [])

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.inputField}>
            <Section.Title style={styles.headline}>How much?</Section.Title>
            <TextInput
              autoFocus={true}
              keyboardType="numeric"
              value={amount}
              onChangeText={handleAmountChange}
              style={styles.amountInput}
            />
          </View>
          <View style={styles.buttonGroup}>
            <Button mode="text" onPress={goBack} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button mode="contained" disabled={amount <= 0} onPress={goNext} style={{ flex: 2 }}>
              Next
            </Button>
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

AmountDialog.navigationOptions = {
  title: RECEIVE_TITLE
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'flex-start',
    width: '100%',
    padding: '1rem'
  },
  section: {
    flex: 1
  },
  sectionRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%'
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

const ReceiveFunnel = createStackNavigator({
  Code: GenerateCode,
  Amount: AmountDialog
})

ReceiveFunnel.navigationOptions = {
  navigationBarHidden: true
}

export default ReceiveFunnel
