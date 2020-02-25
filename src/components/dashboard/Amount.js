// @flow
import React, { useState } from 'react'
import { BN } from 'web3-utils'
import logger from '../../lib/logger/pino-logger'
import { AmountInput, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import goodWallet from '../../lib/wallet/GoodWallet'
import { gdToWei, weiToGd } from '../../lib/wallet/utils'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
}

const log = logger.child({ from: 'Amount' })

const Amount = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params } = props.navigation.state
  const { amount, ...restState } = { amount: 0, ...screenState } || {}
  const [GDAmount, setGDAmount] = useState(amount > 0 ? weiToGd(amount) : '')
  const [loading, setLoading] = useState(amount <= 0)
  const [error, setError] = useState()

  const canContinue = async weiAmount => {
    if (params && params.action === ACTION_RECEIVE) {
      return true
    }
    log.info('canContiniue?', { weiAmount, params })
    try {
      const txFeePercents = await goodWallet.getTxFee().then(n => n / 10000)
      const fee = await goodWallet.calculateTxFee(weiAmount)
      const amountWithFee = new BN(weiAmount).add(fee)

      if (await goodWallet.canSend(amountWithFee, { feeIncluded: true })) {
        return true
      }

      setError(`Sorry, you don't have enough G$ to send ${weiToGd(amountWithFee)} (${txFeePercents}% transaction fee)`)
      return false
    } catch (e) {
      log.error('Failed canContiniue', e.message, e)
      setError(`Sorry, Something unexpected happened, please try again.`)
      return false
    }
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
    setError('')
  }

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Stack grow justifyContent="flex-start">
          <AmountInput
            maxLength={20}
            amount={GDAmount}
            handleAmountChange={handleAmountChange}
            error={error}
            title="How much?"
          />
        </Section.Stack>
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              canContinue={handleContinue}
              values={{ ...restState, amount: gdToWei(GDAmount), params }}
              disabled={loading}
              {...props}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Amount.navigationOptions = navigationOptions

Amount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.nextRoutes
}

export default Amount
