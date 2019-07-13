// @flow
import React, { useState } from 'react'
import { AmountInput, Section, TopBar, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import goodWallet from '../../lib/wallet/GoodWallet'
import { gdToWei, weiToGd } from '../../lib/wallet/utils'

export type AmountProps = {
  screenProps: any,
  navigation: any,
}

const RECEIVE_TITLE = 'Receive G$'

const Amount = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params, amount, ...restState } = { amount: 0, ...screenState } || {}
  const [GDAmount, setGDAmount] = useState(amount > 0 ? weiToGd(amount) : '')
  const [loading, setLoading] = useState(amount <= 0)
  const [error, setError] = useState()

  const canContinue = async weiAmount => {
    if (params && params.toReceive) {
      return true
    }

    if (!(await goodWallet.canSend(weiAmount))) {
      setError(`Sorry, you don't have enough G$`)
      return false
    }
    return true
  }

  const handleContinue = async () => {
    setLoading(true)

    const weiAmount = gdToWei(GDAmount)
    setScreenState({ amount: weiAmount })
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
      <TopBar push={screenProps.push} hideBalance />
      <Section grow>
        <Section.Title>How much?</Section.Title>
        <Section.Stack grow justifyContent="flex-start">
          <AmountInput amount={GDAmount} handleAmountChange={handleAmountChange} error={error} />
        </Section.Stack>
        <Section.Row>
          <Section.Stack grow={1}>
            <BackButton mode="text" screenProps={screenProps} style={{ flex: 1 }}>
              Cancel
            </BackButton>
          </Section.Stack>
          <Section.Stack grow={2}>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              canContinue={handleContinue}
              values={{ ...restState, amount: gdToWei(GDAmount) }}
              disabled={loading}
              {...props}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Amount.navigationOptions = {
  title: RECEIVE_TITLE,
}

Amount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.nextRoutes
}

export default Amount
