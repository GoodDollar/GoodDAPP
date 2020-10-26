// @flow
import React, { useCallback, useMemo } from 'react'
import { useScreenState } from '../appNavigation/stackNavigation'
import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode } from '../../lib/share'
import useNativeSharing from '../../lib/hooks/useNativeSharing'
import GDStore from '../../lib/undux/GDStore'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'
import SummaryGeneric from './SendReceive/SummaryGeneric'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  theme: any,
}

const ReceiveAmount = ({ screenProps, styles }: ReceiveProps) => {
  const gdStore = GDStore.useStore()
  const { navigateTo } = screenProps
  const [screenState] = useScreenState(screenProps)
  const { canShare, generateReceiveShareObject, generateReceiveShareText } = useNativeSharing()

  const { fullName } = gdStore.get('profile')
  const { account, networkId } = goodWallet
  const { amount, reason, counterPartyDisplayName } = screenState

  const codeSource = [account, networkId, amount, reason, counterPartyDisplayName]
  const codeObject = useMemo(() => generateCode(...codeSource), [generateCode, ...codeSource])

  const shareStringSource = [codeObject, amount, counterPartyDisplayName, fullName]
  const shareString = useMemo(
    () => (canShare ? generateReceiveShareObject : generateReceiveShareText)(...shareStringSource),
    [...shareStringSource, canShare, generateReceiveShareObject, generateReceiveShareText],
  )

  // const noCreds = !(counterPartyDisplayName || reason)
  // const iconMarginWithoutReason = useMemo(() => {
  //   return isMobile ? styles.marginForNoCredsMobile : styles.marginForNoCreds
  // }, [styles])
  // const amountMargin = useMemo(() => (isMobile ? styles.amountBlockMarginMobile : styles.amountBlockMargin), [styles])

  const handleConfirm = useCallback(() => {
    navigateTo('TransactionConfirmation', { paymentLink: shareString, action: ACTION_RECEIVE })
  }, [shareString, navigateTo])

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

ReceiveAmount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount
}

export default ReceiveAmount
