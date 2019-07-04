// @flow
import React, { useState } from 'react'
import { AmountInput, Section, TopBar, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import goodWallet from '../../lib/wallet/GoodWallet'
import { gdToWei, weiToGd } from '../../lib/wallet/utils'
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
  const [GDAmount, setGDAmount] = useState(amount > 0 ? weiToGd(amount) : '')
  const [loading, setLoading] = useState(amount <= 0)
  const [showDialogWithData] = useDialog()

  const canContinue = async weiAmount => {
    if (params && params.toReceive) {
      return true
    }

    if (!(await goodWallet.canSend(weiAmount))) {
      showDialogWithData({
        title: 'Cannot send G$',
        message: 'Amount is bigger than balance'
      })
      return false
    }
    return true
  }

  const handleContinue = async () => {
    const weiAmount = gdToWei(GDAmount)
    setScreenState({ amount: weiAmount })

    setLoading(true)
    const can = await canContinue(weiAmount)
    setLoading(false)

    return can
  }

  const handleAmountChange = (value: string) => {
    setGDAmount(value)
    setLoading(value <= 0)
  }

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Title style={styles.headline}>How much?</Section.Title>
        <Section.Stack grow justifyContent="flex-start">
          <AmountInput amount={GDAmount} handleAmountChange={handleAmountChange} />
        </Section.Stack>
        <Section.Row>
          <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
            Cancel
          </BackButton>
          <NextButton
            nextRoutes={screenState.nextRoutes}
            canContinue={handleContinue}
            values={{ amount: gdToWei(GDAmount), to }}
            disabled={loading}
            {...props}
          />
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
