// @flow
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { BN } from 'web3-utils'
import { t } from '@lingui/macro'
import { useGetBridgeData } from '@gooddollar/web3sdk-v2'
import logger from '../../lib/logger/js-logger'
import { AmountInput, ScanQRButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { TokenContext, useFormatToken, useSwitchNetwork, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { decimalsToFixed } from '../../lib/wallet/utils'
import { isIOS } from '../../lib/utils/platform'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'
import mustache from '../../lib/utils/mustache'
import Config from '../../config/config'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const getStylesFromProps = ({ theme }) => ({
  keyboardAvoidWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexGrow: 1,
  },
  buttonsContainer: {
    marginBottom: theme.paddings.bottomPadding,
  },
  nextButtonContainer: {
    minWidth: getDesignRelativeWidth(244),
  },
})

const { isDeltaApp } = Config

const log = logger.child({ from: 'Amount' })

const Amount = (props: AmountProps) => {
  const { screenProps, styles } = props
  const { push } = screenProps
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params = {} } = props.navigation.state
  const { isBridge = false } = params
  const { amount = 0, ...restState } = screenState || {}
  const goodWallet = useWallet()
  const { currentNetwork } = useSwitchNetwork()
  const { bridgeLimits } = useGetBridgeData(goodWallet.networkId, goodWallet.account)
  const { minAmount } = bridgeLimits || { minAmount: 0 }
  const { native, token, balance } = useContext(TokenContext)
  const { toDecimals, fromDecimals } = useFormatToken(token)

  const bridgeState = isBridge
    ? {
        isBridge,
        network: currentNetwork,
      }
    : {}

  const [GDAmount, setGDAmount] = useState(() => (amount ? decimalsToFixed(toDecimals(amount)) : ''))
  const [loading, setLoading] = useState(() => !amount)
  const [error, setError] = useState()

  const GDAmountInWei = useMemo(() => GDAmount && fromDecimals(GDAmount), [GDAmount])

  const isReceive = params && params.action === ACTION_RECEIVE
  const isNativeFlow = isDeltaApp && native

  const handlePressQR = useCallback(() => push('SendByQR'), [push])

  const canContinue = async weiAmount => {
    if (params && params.action === ACTION_RECEIVE) {
      return true
    }

    log.info('canContiniue?', { weiAmount, balance, params })

    try {
      // TODO: tx fee for native token
      const fee = isNativeFlow ? new BN(0) : await goodWallet.calculateTxFee(weiAmount)
      const amount = new BN(weiAmount)
      const amountWithFee = amount.add(fee)
      const canSend = amountWithFee.lte(new BN(String(balance)))

      if (isBridge) {
        const min = parseFloat(toDecimals(minAmount))
        const canBridge = parseInt(GDAmount) >= min

        if (!canBridge) {
          setError(mustache(t`Sorry, minimum amount to bridge is {min} {token}'s`, { min, token }))
          return canBridge
        }
      }

      if (!canSend) {
        setError(mustache(t`Sorry, you don't have enough {token}s`, { token }))
      }

      return canSend
    } catch (e) {
      log.warn('Failed canContiniue', e.message, e)
      setError(t`Sorry, Something unexpected happened, please try again.`)
      return false
    }
  }

  const handleContinue = async () => {
    setLoading(true)

    setScreenState({ amount: GDAmountInWei })
    const can = await canContinue(GDAmountInWei)

    setLoading(false)

    return can
  }

  const handleAmountChange = (value: string) => {
    setGDAmount(value)
    setLoading(!value)
    setError('')
  }

  const showScanQR = !isReceive && !params?.counterPartyDisplayName // ot in receive flow and also QR wasnt displayed on Who screen

  return (
    <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.keyboardAvoidWrapper}>
      <Wrapper withGradient={true}>
        <TopBar push={screenProps.push} isBridge={isBridge} network={currentNetwork}>
          {showScanQR && !isBridge && !isNativeFlow && <ScanQRButton onPress={handlePressQR} />}
        </TopBar>
        <Section grow style={styles.buttonsContainer}>
          <Section.Stack grow justifyContent="flex-start">
            <AmountInput
              maxLength={20}
              amount={GDAmount}
              handleAmountChange={handleAmountChange}
              error={error}
              title={t`How much?`}
              unit={token}
            />
          </Section.Stack>
          <Section.Row>
            <Section.Row grow={1} justifyContent="flex-start">
              <BackButton mode="text" screenProps={screenProps}>
                {t`Cancel`}
              </BackButton>
            </Section.Row>
            <Section.Stack grow={3} style={styles.nextButtonContainer}>
              <NextButton
                nextRoutes={
                  isBridge
                    ? ['SendLinkSummary', 'Home']
                    : isReceive
                    ? ['Reason', 'ReceiveSummary', 'TransactionConfirmation']
                    : isNativeFlow
                    ? ['SendToAddress', 'SendLinkSummary', 'TransactionConfirmation']
                    : ['Reason', 'SendLinkSummary', 'TransactionConfirmation']
                }
                canContinue={handleContinue}
                values={{ ...params, ...restState, amount: GDAmountInWei, ...bridgeState }}
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

export default withStyles(getStylesFromProps)(Amount)
