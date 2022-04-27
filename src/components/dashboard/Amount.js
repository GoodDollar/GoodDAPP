// @flow
import React, { useCallback, useState } from 'react'
import { KeyboardAvoidingView, StyleSheet } from 'react-native'
import { BN } from 'web3-utils'
import { t } from '@lingui/macro'
import logger from '../../lib/logger/js-logger'
import { AmountInput, ScanQRButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import goodWallet from '../../lib/wallet/GoodWallet'
import { gdToWei, weiToGd } from '../../lib/wallet/utils'
import { isIOS } from '../../lib/utils/platform'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
}

const styles = StyleSheet.create({
  keyboardAvoidWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexGrow: 1,
  },
})

const log = logger.child({ from: 'Amount' })

const Amount = (props: AmountProps) => {
  const { screenProps } = props
  const { push } = screenProps
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params } = props.navigation.state
  const { amount, ...restState } = { amount: 0, ...screenState } || {}
  const [GDAmount, setGDAmount] = useState(amount > 0 ? weiToGd(amount) : '')
  const [loading, setLoading] = useState(amount <= 0)
  const [error, setError] = useState()
  const isReceive = params && params.action === ACTION_RECEIVE

  const handlePressQR = useCallback(() => push('SendByQR'), [push])

  const canContinue = async weiAmount => {
    if (params && params.action === ACTION_RECEIVE) {
      return true
    }
    log.info('canContiniue?', { weiAmount, params })
    try {
      // const txFeePercents = await goodWallet.getTxFee().then(n => n / 10000)
      const fee = await goodWallet.calculateTxFee(weiAmount)
      const amountWithFee = new BN(weiAmount).add(fee)

      if (await goodWallet.canSend(amountWithFee, { feeIncluded: true })) {
        return true
      }

      // setError(`Sorry, you don't have enough G$ to send ${weiToGd(amountWithFee)} (${txFeePercents}% transaction fee)`)
      setError(t`Sorry, you don't have enough G$s`)

      return false
    } catch (e) {
      log.warn('Failed canContiniue', e.message, e)
      setError(t`Sorry, Something unexpected happened, please try again.`)
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

  const showScanQR = !isReceive && !params?.counterPartyDisplayName //not in receive flow and also QR wasnt displayed on Who screen
  return (
    <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.keyboardAvoidWrapper}>
      <Wrapper>
        <TopBar push={screenProps.push}>
          {showScanQR && <ScanQRButton onPress={handlePressQR} />}
          {/* {!isReceive && <SendToAddressButton onPress={handlePressSendToAddress} />} */}
        </TopBar>
        <Section grow>
          <Section.Stack grow justifyContent="flex-start">
            <AmountInput
              maxLength={20}
              amount={GDAmount}
              handleAmountChange={handleAmountChange}
              error={error}
              title={t`How much?`}
            />
          </Section.Stack>
          <Section.Row>
            <Section.Row grow={1} justifyContent="flex-start">
              <BackButton mode="text" screenProps={screenProps}>
                {t`Cancel`}
              </BackButton>
            </Section.Row>
            <Section.Stack grow={3}>
              <NextButton
                nextRoutes={
                  isReceive
                    ? ['Reason', 'ReceiveSummary', 'TransactionConfirmation']
                    : ['Reason', 'SendLinkSummary', 'TransactionConfirmation']
                }
                canContinue={handleContinue}
                values={{ ...params, ...restState, amount: gdToWei(GDAmount) }}
                disabled={loading}
                {...props}
              />
            </Section.Stack>
          </Section.Row>
        </Section>
      </Wrapper>
    </KeyboardAvoidingView>
  )
}

Amount.navigationOptions = navigationOptions

export default Amount
