// @flow
import React, { useMemo } from 'react'

import { Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import SummaryTable from '../common/view/SummaryTable'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { PushButton } from '../appNavigation/PushButton'

import { withStyles } from '../../lib/styles'
import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode } from '../../lib/share'
import normalize from '../../lib/utils/normalizeText'
import { navigationOptions } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  theme: any,
}

const ReceiveAmount = ({ screenProps, styles, ...props }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)
  const { params } = props.navigation.state

  const { amount, reason, counterPartyDisplayName } = screenState

  const { account, networkId } = goodWallet
  const code = useMemo(() => generateCode(account, networkId, amount, reason, counterPartyDisplayName), [
    account,
    networkId,
    amount,
    reason,
    counterPartyDisplayName,
  ])

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section justifyContent="space-between" grow>
        <Section.Title>Summary</Section.Title>
        <SummaryTable
          actionReceive={true}
          counterPartyDisplayName={counterPartyDisplayName}
          amount={amount}
          reason={reason}
        />
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps} textStyle={styles.cancelButton}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <PushButton
              routeName="Confirmation"
              screenProps={screenProps}
              params={{ reason, amount, code, counterPartyDisplayName, params }}
            >
              Confirm
            </PushButton>
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

ReceiveAmount.navigationOptions = navigationOptions

ReceiveAmount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount
}

const getStylesFromProps = ({ theme }) => ({
  cancelButton: {
    color: theme.colors.gray80Percent,
    fontSize: normalize(14),
    fontWeight: '500',
  },
})

export default withStyles(getStylesFromProps)(ReceiveAmount)
