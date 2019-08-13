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
      <Section grow justifyContent={'center'}>
        <Section.Text
          style={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          fontSize={22}
          fontWeight={'500'}
        >
          {`To complete the transaction\ncopy the link and share it\nwith your recipient.`}
        </Section.Text>
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
