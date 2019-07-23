// @flow
import React from 'react'
import InputText from '../common/form/InputText'

import { ScanQRButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
}

const Who = (props: AmountProps) => {
  const { screenProps } = props

  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params } = props.navigation.state
  const text = params && params.action === ACTION_RECEIVE ? 'From Who?' : 'Send To?'
  const { counterPartyDisplayName } = screenState
  console.info('Component props -> ', { props, params, text })

  return (
    <Wrapper>
      <TopBar push={screenProps.push}>
        {params && params.action !== ACTION_RECEIVE && <ScanQRButton onPress={() => screenProps.push('SendByQR')} />}
      </TopBar>
      <Section grow>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Title>{text}</Section.Title>
          <InputText
            autoFocus
            style={props.styles.input}
            value={counterPartyDisplayName}
            onChangeText={counterPartyDisplayName => setScreenState({ counterPartyDisplayName })}
            placeholder="Enter the recipient name"
          />
        </Section.Stack>
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <NextButton
              nextRoutes={screenState.nextRoutes}
              values={{ params, counterPartyDisplayName }}
              {...props}
              label={counterPartyDisplayName ? 'Next' : 'Skip'}
            />
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

Who.navigationOptions = navigationOptions

Who.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.nextRoutes
}

export default withStyles(({ theme }) => ({ input: { marginTop: theme.sizes.defaultDouble } }))(Who)
