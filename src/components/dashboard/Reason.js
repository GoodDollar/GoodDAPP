// @flow
import React from 'react'
import { TextInput } from 'react-native-paper'

import { Section, TopBar, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Send G$'

const SendReason = (props: AmountProps) => {
  const { screenProps } = props

  const [screenState, setScreenState] = useScreenState(screenProps)
  const { reason, ...restState } = screenState

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Title>What For?</Section.Title>
          <TextInput
            autoFocus
            value={reason}
            onChangeText={reason => setScreenState({ reason })}
            placeholder="Add a message"
          />
        </Section.Stack>
        <Section.Row>
          <Section.Stack grow={1}>
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Stack>
          <Section.Stack grow={2}>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              values={{ ...restState, reason }}
              {...props}
              label={reason ? 'Next' : 'Skip'}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

SendReason.navigationOptions = {
  title: TITLE
}

SendReason.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount >= 0 && screenState.nextRoutes
}

export default SendReason
