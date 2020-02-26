// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { Button, PermissionsAndroid, Platform } from 'react-native'
import Contacts from 'react-native-contacts'
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
  const [contacts, setContacts] = useState([])

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

  const getContacts = () => {
    Contacts.getAll((err, contacts) => {
      if (err === 'denied') {
        console.warn('Permission to access contacts was denied')
      } else {
        setContacts(contacts)
      }
    })
  }

  const handleContacts = () => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
        buttonPositive: 'Please accept bare mortal',
      }).then(() => {
        getContacts()
      })
    } else {
      getContacts()
    }
  }

  console.log(contacts)

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
            placeholder="Enter the recipient name"
            style={styles.input}
            value={state.value}
            enablesReturnKeyAutomatically
            onSubmitEditing={next}
          />
          {Platform.OS !== 'web' && (
            <Button title="Contact" onPress={handleContacts}>
              {'Pick a contact'}
            </Button>
          )}
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
