// @flow
import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { TextInput } from 'react-native-paper'

import { CustomButton as Button, Section, Wrapper } from '../common'
import { fontStyle } from '../common/styles'
import { BackButton, PushButton } from '../appNavigation/stackNavigation'
import TopBar from '../common/TopBar'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'

const Amount = ({ screenProps, navigation }: AmountProps) => {
  const [amount, setAmount] = useState('')

  const goBack = useCallback(() => navigation.navigate('Dashboard'), [])

  const handleAmountChange = useCallback((value: string = '0') => {
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
            <View style={styles.amountWrapper}>
              <TextInput
                focus={true}
                keyboardType="numeric"
                placeholder="0"
                value={amount}
                onChangeText={handleAmountChange}
                style={styles.amountInput}
              />
              <Text style={styles.amountSuffix}>GD</Text>
            </View>
          </View>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <PushButton
              mode="contained"
              disabled={!amount}
              screenProps={{ ...screenProps }}
              params={{ amount }}
              routeName="Receive"
              style={{ flex: 2 }}
            >
              Next
            </PushButton>
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Amount.navigationOptions = {
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
  amountWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    borderBottom: '1px solid #555'
  },
  amountInput: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: normalize(26),
    height: normalize(40),
    lineHeight: normalize(40),
    maxWidth: '50%',
    flexShrink: 1,
    flexGrow: 1,
    textAlign: 'justify',
    textAlignLast: 'right',
    whiteSpace: 'normal',
    marginRight: normalize(-5)
  },
  amountSuffix: {
    flexGrow: 1,
    height: normalize(40),
    fontSize: normalize(10),
    justifyContent: 'center',
    lineHeight: normalize(40),
    paddingTop: normalize(10)
  }
})

export default Amount
