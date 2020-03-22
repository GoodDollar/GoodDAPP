// @flow
import React, { useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import InputText from '../common/form/InputText'
import { ScanQRButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import useValidatedValueState from '../../lib/utils/useValidatedValueState'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'

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
  const { params } = props.navigation.state
  const isReceive = params && params.action === ACTION_RECEIVE
  const { counterPartyDisplayName } = screenState
  const text = isReceive ? 'From Who?' : 'Send To?'
  const getErrorFunction = isReceive ? () => null : getError
  const [state, setValue] = useValidatedValueState(counterPartyDisplayName, getErrorFunction)

  useEffect(() => {
    setScreenState({ counterPartyDisplayName: state.value })
  }, [state.value])
  console.info('Component props -> ', { props, params, text, state })

  const next = useCallback(() => {
    if (state.isValid) {
      const [nextRoute, ...nextRoutes] = screenState.nextRoutes || []

      props.screenProps.push(nextRoute, {
        nextRoutes,
        params,
        counterPartyDisplayName: state.value,
      })
    }
  }, [state.isValid, state.value, screenState.nextRoutes, params])

  return (
    <Wrapper>
      <TopBar push={screenProps.push}>
        {!isReceive && <ScanQRButton onPress={() => screenProps.push('SendByQR')} />}
      </TopBar>
      <Section grow>
        <Section.Stack justifyContent="space-between" style={styles.container}>
          <Section.Title fontWeight="medium">{text}</Section.Title>
          <InputText
            autoFocus
            error={state.error}
            onChangeText={setValue}
            maxLength={128}
            placeholder="Enter the recipient name"
            style={styles.input}
            value={state.value}
            enablesReturnKeyAutomatically
            onSubmitEditing={next}
          />
        </Section.Stack>
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
      </Section>
    </Wrapper>
  )
}

Who.navigationOptions = navigationOptions

Who.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.nextRoutes
}

export default withStyles(({ theme }) => ({
  input: {
    marginTop: Platform.select({
      web: 'auto',
      default: 40,
    }),
  },
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
  },
}))(Who)
