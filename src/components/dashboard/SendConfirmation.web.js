// @flow
import React from 'react'
import { useScreenState } from '../appNavigation/stackNavigation'
import { CopyButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { withStyles } from '../../lib/styles'
import SummaryTable from '../common/view/SummaryTable'
import { SEND_TITLE } from './utils/sendReceiveFlow'

import './AButton.css'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const SendConfirmation = ({ screenProps, styles }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)

  const { amount, counterPartyDisplayName, reason, paymentLink } = screenState

  return (
    <Wrapper>
      <TopBar hideBalance push={screenProps.push} />
      <Section grow>
        <Section.Title textTransform="none">You can send G$ to anyone in the world</Section.Title>
        <Section.Text>Simply, copy and share this link with your recipient.</Section.Text>
        <SummaryTable counterPartyDisplayName={counterPartyDisplayName} amount={amount} reason={reason} />
        <CopyButton toCopy={paymentLink} onPressDone={() => screenProps.goToRoot()}>
          Copy link to clipboard
        </CopyButton>
      </Section>
    </Wrapper>
  )
}

SendConfirmation.navigationOptions = {
  title: SEND_TITLE,
  backButtonHidden: true,
}

SendConfirmation.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return !!screenState.paymentLink
}

export default withStyles()(SendConfirmation)
