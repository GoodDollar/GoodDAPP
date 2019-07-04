// @flow
import React from 'react'
import { TextInput } from 'react-native-paper'

import { Section, TopBar, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'

export type AmountProps = {
  screenProps: any,
  navigation: any
}

const TITLE = 'Receive G$'

const ReceiveFrom = (props: AmountProps) => {
  const { screenProps } = props

  const [screenState, setScreenState] = useScreenState(screenProps)
  const { fromWho } = screenState

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Title>From Who?</Section.Title>
          <TextInput
            autoFocus
            value={fromWho}
            onChangeText={fromWho => setScreenState({ fromWho })}
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
              values={{ fromWho }}
              {...props}
              label={fromWho ? 'Next' : 'Skip'}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

ReceiveFrom.navigationOptions = {
  title: TITLE
}

ReceiveFrom.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.nextRoutes
}

export default ReceiveFrom
