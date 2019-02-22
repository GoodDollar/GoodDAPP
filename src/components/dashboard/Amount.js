// @flow
import React, { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'

import { Section, Wrapper } from '../common'
import { BackButton, PushButton } from '../appNavigation/stackNavigation'
import { receiveStyles as styles } from './styles'
import TopBar from '../common/TopBar'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'

const Amount = (props: AmountProps) => {
  const { screenProps, navigation } = props
  const next = navigation.getParam('next', 'ReceiveAmount')

  const [amount, setAmount] = useState('')

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
              routeName={next}
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

export default Amount
