// @flow
import React, { useCallback, useEffect, useState } from 'react'
import { PermissionsAndroid, Platform, ScrollView } from 'react-native'
import Contacts from 'react-native-contacts'
import InputText from '../common/form/InputText'
import { ScanQRButton, Section, SendToAddress, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import useValidatedValueState from '../../lib/utils/useValidatedValueState'
import { isAndroid, isMobileNative } from '../../lib/utils/platform'
import { ACTION_RECEIVE, navigationOptions } from './utils/sendReceiveFlow'
import ContactsSearch from './ContactsSearch'

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

  const getAllContacts = () => {
    Contacts.getAll((err, contacts) => {
      if (err === 'denied') {
        console.warn('permissions denied')
      } else {
        setContacts(contacts)
      }
    })
  }

  const showPermissionsAndroid = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
      title: 'Contacts',
      message: 'This app would like to view your contacts.',
      buttonPositive: 'Please accept bare mortal',
    }).then(() => {
      getAllContacts()
    })
  }

  useEffect(() => {
    if (Contacts) {
      if (isAndroid) {
        showPermissionsAndroid()
      } else {
        getAllContacts()
      }
    }
  }, [])

  const handleSearch = useCallback(
    query => {
      const queryIsNumber = parseInt(query)
      if (state) {
        setValue(query)
      }
      if (query && !query.includes('+') && !query.includes('*')) {
        if (typeof queryIsNumber === 'number' && !isNaN(queryIsNumber)) {
          return setContacts(
            contacts.filter(({ phoneNumbers }) =>
              new RegExp(`^(.*(${query}).*)$`, 'gmi').test(phoneNumbers[0] && phoneNumbers[0].number)
            )
          )
        }
        if (typeof query === 'string') {
          return setContacts(
            contacts.filter(({ givenName, familyName }) => {
              const fullName = `${givenName} ${familyName}`
              return new RegExp(`^(.*(${query}).*)$`, 'gmi').test(fullName)
            })
          )
        }
      } else {
        return getAllContacts()
      }
    },
    [contacts || state.value]
  )

  const Scroll = isMobileNative ? ScrollView : React.Fragment

  return (
    <Wrapper style={styles.wrapper}>
      <TopBar push={screenProps.push} hideProfile={!isReceive}>
        {!isReceive && <SendToAddress />}
        {!isReceive && (
          <ScanQRButton
            onPress={() => screenProps.push('SendByQR')}
            direction={{ flexDirection: isMobileNative ? 'column-reverse' : 'row' }}
          />
        )}
      </TopBar>
      <Scroll>
        <Section grow>
          <Section.Stack justifyContent="space-around" style={styles.container}>
            <Section.Title fontWeight="medium">{text}</Section.Title>
            <InputText
              error={state.error}
              onChangeText={isMobileNative ? handleSearch : setValue}
              placeholder={isMobileNative ? 'Search contact name / phone' : 'Enter the recipient name'}
              style={styles.input}
              value={state.value}
              enablesReturnKeyAutomatically
              onSubmitEditing={next}
              iconName={isMobileNative && 'search'}
            />
          </Section.Stack>
          {isMobileNative && <ContactsSearch contacts={contacts} setValue={setValue} />}
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
      </Scroll>
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
    }),
  },
  container: {
    minHeight: getDesignRelativeHeight(180),
    height: getDesignRelativeHeight(180),
  },
  wrapper: {
    flex: 1,
  },
  webScroll: {
    display: 'contents',
  },
}))(Who)
