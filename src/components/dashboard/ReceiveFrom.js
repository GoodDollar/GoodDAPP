// @flow
import React from 'react'
import InputText from '../common/form/InputText'

import { Section, TopBar, Wrapper } from '../common'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
export type AmountProps = {
  screenProps: any,
  navigation: any,
}

const TITLE = 'Receive G$'

const ReceiveFrom = (props: AmountProps) => {
  const { screenProps } = props

  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params } = screenState || {}
  const { fromWho } = screenState

  return (
    <Wrapper>
      <TopBar push={screenProps.push} hideBalance />
      <Section grow>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Title>From Who?</Section.Title>
          <InputText
            autoFocus
            style={props.styles.input}
            value={fromWho}
            onChangeText={fromWho => setScreenState({ fromWho })}
            placeholder="Enter the recipient name"
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
              values={{ params, fromWho }}
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
  title: TITLE,
}

ReceiveFrom.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.nextRoutes
}

export default withStyles(({ theme }) => ({ input: { marginTop: theme.sizes.defaultDouble } }))(ReceiveFrom)
