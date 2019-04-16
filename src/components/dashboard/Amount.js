// @flow
import React, { useCallback } from 'react'
import { Text, View } from 'react-native'

import { Section, Wrapper, TopBar, InputGoodDollar } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { receiveStyles as styles } from './styles'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'

const Amount = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState, setScreenState] = useScreenState(screenProps)

  const { amount, to, profile } = screenState || {}
  const handleAmountChange = useCallback((value: string) => setScreenState({ amount: parseInt(value) }), ['0'])
  return (
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.inputField}>
            <Section.Title style={styles.headline}>How much?</Section.Title>
            <View style={styles.amountWrapper}>
              <Text style={styles.amountInputWrapper}>
                <InputGoodDollar
                  focus="true"
                  wei={amount}
                  onChangeWei={handleAmountChange}
                  style={styles.amountInput}
                />
              </Text>
              <Text style={styles.amountSuffix}>GD</Text>
            </View>
          </View>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              values={{ amount, to, profile }}
              disabled={!amount}
              {...props}
            />
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Amount.navigationOptions = {
  title: RECEIVE_TITLE
}

Amount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.nextRoutes
}

export default Amount
