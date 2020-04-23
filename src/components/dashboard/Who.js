// @flow
import React, { useCallback, useEffect, useState } from 'react'
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
  const { counterPartyDisplayName } = screenState
  const text = isReceive ? 'From Who?' : 'Send To?'
  const getErrorFunction = isReceive ? () => null : getError
  const [state, setValue] = useValidatedValueState(counterPartyDisplayName, getErrorFunction)
  const [showNext, setShowNext] = useState(!isMobileNative)
  const [contact, setContact] = useState()

  useEffect(() => {
    setScreenState({ counterPartyDisplayName: (contact && contact.fullName) || state.value })
  }, [contact, state.value])

  console.info('Component props -> ', { props, params, text, state })

  const next = useCallback(() => {
    if (state.isValid || contact) {
      const [nextRoute, ...nextRoutes] = screenState.nextRoutes || []

      props.screenProps.push(nextRoute, {
        nextRoutes,
        params,
        counterPartyDisplayName: (contact && contact.fullName) || state.value,
        contact: contact,
      })
    }
  }, [state.isValid, state.value, contact, screenState.nextRoutes, params])

  useEffect(() => {
    if (contact) {
      next()
    }
  }, [contact])

  const Scroll = isMobileNative ? ScrollView : React.Fragment

  return (
    <Wrapper style={{ flex: 1 }}>
      <TopBar push={screenProps.push} hideProfile={!isReceive}>
        {!isReceive && <SendToAddress />}
        {!isReceive && (
          <ScanQRButton onPress={() => screenProps.push('SendByQR')} style={{ flexDirection: 'column-reverse' }} />
        )}
      </TopBar>
      <Scroll>
        <Section grow>
          <WhoContent
            setName={setValue}
            error={state.error}
            state={state}
            text={text}
            value={state.value}
            next={next}
            showNext={setShowNext}
            setContact={setContact}
            setValue={setValue}
          />
          {showNext && (
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
                  values={{ params, counterPartyDisplayName: state.value }}
                  canContinue={() => state.isValid}
                  label={state.value || !isReceive ? 'Next' : 'Skip'}
                  disabled={!state.isValid}
                />
              </Section.Stack>
            </Section.Row>
          )}
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
