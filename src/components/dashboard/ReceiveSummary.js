// @flow
import React, { useCallback, useMemo } from 'react'
import { useScreenState } from '../appNavigation/stackNavigation'
import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode, generateReceiveShareObject } from '../../lib/share'
import useProfile from '../../lib/userStorage/useProfile'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'
import SummaryGeneric from './SendReceive/SummaryGeneric'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  theme: any,
}

const ReceiveAmount = ({ screenProps, styles }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)

  const { navigateTo } = screenProps
  const { fullName } = useProfile()
  const { amount, reason, category, counterPartyDisplayName } = screenState

  const shareOrString = useMemo(() => {
    const { account, networkId } = goodWallet
    const code = generateCode(account, networkId, amount, reason, category, counterPartyDisplayName)

    return generateReceiveShareObject(code, amount, counterPartyDisplayName, fullName)
  }, [amount, reason, counterPartyDisplayName])

  const handleConfirm = useCallback(() => {
    navigateTo('TransactionConfirmation', { paymentLink: shareOrString, action: ACTION_RECEIVE })
  }, [shareOrString, navigateTo])

  return (
    <SummaryGeneric
      screenProps={screenProps}
      onConfirm={handleConfirm}
      recipient={counterPartyDisplayName}
      amount={amount}
      reason={reason}
      iconName="receive"
      title="YOU ARE REQUESTING"
      action="receive"
    />
  )
}

ReceiveAmount.navigationOptions = navigationOptions

ReceiveAmount.shouldNavigateToComponent = ({ screenProps }) => {
  const { screenState } = screenProps

  return screenState.amount
}

export default ReceiveAmount
