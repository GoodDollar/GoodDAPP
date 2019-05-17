// @flow
import React, { useState } from 'react'
import { Text, View } from 'react-native'

import { Section, Wrapper, TopBar, InputGoodDollar } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { receiveStyles as styles } from './styles'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { useDialog } from '../../lib/undux/utils/dialog'
import get from 'lodash/get'
export type AmountProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'
const log = logger.child({ from: RECEIVE_TITLE })

const Amount = (props: AmountProps) => {
  const { screenProps } = props
  const [amount, setAmount] = useState(get(screenProps, 'screenState.amount', 0))
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { to, params } = screenState || {}
  const [showDialogWithData] = useDialog()

  const canContinue = async () => {
    if (params && params.toReceive) return true

    if (!(await goodWallet.canSend(amount))) {
      showDialogWithData({
        title: 'Cannot send GD',
        message: 'Amount is bigger than balance'
      })
      return false
    }
    return true
  }
  const handleAmountChange = (value: number) => setAmount(value) //setScreenState({ amount: value })
  return (
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} />
      <Section style={styles.section}>
        <Section.Row style={styles.sectionRow}>
          <View style={styles.inputField}>
            <Section.Title style={styles.headline}>How much?</Section.Title>
            <View style={styles.amountWrapper}>
              <Text style={styles.amountInputWrapper}>
                <InputGoodDollar autoFocus wei={amount} onChangeWei={handleAmountChange} style={styles.amountInput} />
              </Text>
            </View>
          </View>
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              canContinue={canContinue}
              values={{ amount, to }}
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
