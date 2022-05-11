// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { KeyboardAvoidingView, ScrollView } from 'react-native'
import { noop } from 'lodash'

import { ScanQRButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import useValidatedValueState from '../../lib/utils/useValidatedValueState'
import { isIOS, isMobileNative } from '../../lib/utils/platform'
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
  const { screenProps, styles } = props
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { push } = screenProps
  const { params } = props.navigation.state
  const isReceive = params && params.action === ACTION_RECEIVE
  const { counterPartyDisplayName } = screenState
  const text = isReceive ? 'From Who?' : 'Send To?'
  const getErrorFunction = isReceive ? noop : getError
  const [state, setValue] = useValidatedValueState(counterPartyDisplayName, getErrorFunction)
  const [showNext, setShowNext] = useState(!isMobileNative)
  const [contact, setContact] = useState()

  useEffect(() => {
    setScreenState({ counterPartyDisplayName: (contact && contact.fullName) || state.value })
  }, [contact, state.value])

  const handlePressQR = useCallback(() => push('SendByQR'), [push])

  // const handlePressSendToAddress = useOnPress(
  //   () =>
  //     push('SendToAddress', {
  //       nextRoutes: ['Amount', 'Reason', 'SendLinkSummary'],
  //       action: ACTION_SEND_TO_ADDRESS,
  //     }),
  //   [push],
  // )

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
  const canContinue = useCallback(() => state.isValid, [state])

  return (
    <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.keyboardAvoidWrapper}>
      <Scroll>
        <Wrapper>
          <TopBar push={screenProps.push} hideProfile={!isReceive}>
            {!isReceive && <ScanQRButton onPress={handlePressQR} />}
            {/* {!isReceive && <SendToAddressButton onPress={handlePressSendToAddress} />} */}
          </TopBar>
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
                    canContinue={canContinue}
                    label={state.value || !isReceive ? 'Next' : 'Skip'}
                    disabled={!state.isValid}
                  />
                </Section.Stack>
              </Section.Row>
            )}
          </Section>
        </Wrapper>
      </Scroll>
    </KeyboardAvoidingView>
  )
}

Who.navigationOptions = navigationOptions

Who.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.nextRoutes
}

export default withStyles(({ theme }) => ({
  keyboardAvoidWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexGrow: 1,
  },
  input: {
    marginTop: 'auto',
  },
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
  },
}))(Who)
