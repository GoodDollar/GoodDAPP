// @flow
import React, { useCallback, useEffect } from 'react'
import { ScrollView } from 'react-native'
import { ScanQRButton, Section, SendToAddress, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import useValidatedValueState from '../../lib/utils/useValidatedValueState'
import { isMobileNative } from '../../lib/utils/platform'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'
import WhoContent from './WhoContent'

export type AmountProps = {
  screenProps: any,
  navigation: any,
}

const getError = value => {
  if (!value) {
    return 'Name is mandatory'
  }

  return null
}

const Who = (props: AmountProps) => {
  const { screenProps } = props
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params } = props.navigation.state
  const isReceive = params && params.action === ACTION_RECEIVE
  const { counterPartyDisplayName, phoneNumber } = screenState
  const text = isReceive ? 'From Who?' : 'Send To?'
  const getErrorFunction = isReceive ? () => null : getError
  const [state, setValue] = useValidatedValueState(counterPartyDisplayName, getErrorFunction)
  const [phone, setPhone] = useValidatedValueState(phoneNumber, getErrorFunction)

  useEffect(() => {
    setScreenState({ counterPartyDisplayName: state.value, phoneNumber: phone.value })
  }, [state.value])
  console.info('Component props -> ', { props, params, text, state })

  const next = useCallback(() => {
    if (state.isValid) {
      const [nextRoute, ...nextRoutes] = screenState.nextRoutes || []

      props.screenProps.push(nextRoute, {
        nextRoutes,
        params,
        phoneNumber: phone && phone.value,
        counterPartyDisplayName: state.value,
      })
    }
  }, [state.isValid, state.value, screenState.nextRoutes, params])

  const Scroll = isMobileNative ? ScrollView : React.Fragment

  return (
    <Wrapper style={{ flex: 1 }}>
      <TopBar push={screenProps.push} hideProfile={!isReceive}>
        {!isReceive && <SendToAddress />}
        {!isReceive && (
          <ScanQRButton onPress={() => screenProps.push('SendByQR')} direction={{ flexDirection: 'column-reverse' }} />
        )}
      </TopBar>
      <Scroll>
        <Section grow>
          <WhoContent
            setName={setValue}
            setPhone={setPhone}
            error={state.error}
            state={state}
            text={text}
            value={state.value}
            next={next}
          />
          <Section.Row grow alignItems="flex-end">
            <Section.Row grow={1} justifyContent="flex-start">
              <BackButton mode="text" screenProps={screenProps}>
                Cancel
              </BackButton>
            </Section.Row>
            <Section.Stack grow={3}>
              <NextButton
                {...props}
                nextRoutes={screenState.nextRoutes}
                values={{ params, counterPartyDisplayName: state.value, phoneNumber: phone && phone.value }}
                canContinue={() => state.isValid}
                label={state.value || !isReceive ? 'Next' : 'Skip'}
                disabled={!state.isValid}
              />
            </Section.Stack>
          </Section.Row>
        </Section>
      </Scroll>
    </Wrapper>
  )
}

Who.navigationOptions = navigationOptions

Who.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.nextRoutes
}

export default Who
