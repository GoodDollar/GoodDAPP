// @flow
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { AmountInput, Section, TopBar, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import goodWallet from '../../lib/wallet/GoodWallet'
import { useDialog } from '../../lib/undux/utils/dialog'
import { receiveStyles as styles } from './styles'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive G$'

const Amount = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { to, params, amount } = { amount: 0, ...screenState } || {}
  const [loading, setLoading] = useState(amount <= 0)
  const [showDialogWithData] = useDialog()

  const canContinue = async () => {
    if (params && params.toReceive) {
      return true
    }

    if (!(await goodWallet.canSend(amount))) {
      showDialogWithData({
        title: 'Cannot send G$',
        message: 'Amount is bigger than balance'
      })

      return false
    }

    return true
  }

  const handleContinue = async () => {
    setLoading(true)

    const can = await canContinue()
    setLoading(false)

    return can
  }

  const handleAmountChange = (value: number) => {
    setScreenState({ amount: value })
    setLoading(value <= 0)
  }

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} />
      <Section style={customStyles.section}>
        <Section.Row style={styles.sectionRow}>
          <AmountInput amount={amount} handleAmountChange={handleAmountChange} />
          <View style={styles.buttonGroup}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              canContinue={handleContinue}
              values={{ amount, to }}
              disabled={loading}
              {...props}
            />
          </View>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const customStyles = StyleSheet.create({
  section: {
    flex: 1,
    backgroundColor: '#fff'
  }
})

Amount.navigationOptions = {
  title: RECEIVE_TITLE
}

Amount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.nextRoutes
}

export default Amount
