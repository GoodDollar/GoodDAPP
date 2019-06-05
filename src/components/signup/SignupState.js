// @flow
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, AsyncStorage } from 'react-native'
import NameForm from './NameForm'
import EmailForm from './EmailForm'
import PhoneForm from './PhoneForm'
import SmsForm from './SmsForm'
import EmailConfirmation from './EmailConfirmation'
import SignupCompleted from './SignupCompleted'
import NavBar from '../appNavigation/NavBar'
import { scrollableContainer } from '../common/styles'

import { createSwitchNavigator } from '@react-navigation/core'
import { navigationConfig } from '../appNavigation/navigationConfig'
import logger from '../../lib/logger/pino-logger'

import { useWrappedApi } from '../../lib/API/useWrappedApi'
import goodWallet from '../../lib/wallet/GoodWallet'
import userStorage from '../../lib/gundb/UserStorage'
import type { SMSRecord } from './SmsForm'
import GDStore from '../../lib/undux/GDStore'
import { getUserModel, type UserModel } from '../../lib/gundb/UserModel'
import Config from '../../config/config'
const log = logger.child({ from: 'SignupState' })

export type SignupState = UserModel & SMSRecord

const SignupWizardNavigator = createSwitchNavigator(
  {
    Name: NameForm,
    Phone: PhoneForm,
    SMS: SmsForm,
    Email: EmailForm,
    EmailConfirmation,
    SignupCompleted
  },
  navigationConfig
)

declare var amplitude
const Signup = ({ navigation, screenProps }: { navigation: any, screenProps: any }) => {
  const API = useWrappedApi()
  const initialState: SignupState = {
    ...getUserModel({
      fullName: '',
      email: '',
      mobile: ''
    }),
    smsValidated: false,
    isEmailConfirmed: false,
    jwt: ''
  }

  const [state, setState] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(undefined)

  const store = GDStore.useStore()
  // const { loading } = store.get('currentScreen')

  function saveProfile() {
    return userStorage.setProfile({ ...state, walletAddress: goodWallet.account })
  }

  const navigateWithFocus = (routeKey: string) => {
    navigation.navigate(routeKey)
    // store.set('currentScreen')({ loading: false })
    setLoading(false)
    setTimeout(() => {
      const el = document.getElementById(routeKey + '_input')
      if (el) el.focus()
    }, 300)
  }
  const fireSignupEvent = (event?: string) => {
    const Amplitude = amplitude.getInstance()
    let curRoute = navigation.state.routes[navigation.state.index]
    let res = Amplitude.logEvent(`SIGNUP_${event || curRoute.key}`)
    if (!res) log.warn('Amplitude event not sent')
    console.log('fired event', `SIGNUP_${event || curRoute.key}`)
  }

  useEffect(() => {
    fireSignupEvent('STARTED')
  }, [])
  const done = async (data: { [string]: string }) => {
    // store.set('currentScreen')({ loading: true })
    setLoading(true)
    setError()
    fireSignupEvent()
    log.info('signup data:', { data })
    let nextRoute = navigation.state.routes[navigation.state.index + 1]
    const newState = { ...state, ...data }
    setState(newState)

    if (nextRoute && nextRoute.key === 'SMS') {
      try {
        let { data } = await API.sendOTP(newState)
        if (data.ok === 0) {
          setLoading(false)
          return setError(data.error)
        }
        return navigateWithFocus(nextRoute.key)
      } catch (e) {
        log.error(e)
      }
    } else if (nextRoute && nextRoute.key === 'EmailConfirmation') {
      try {
        const { data } = await API.sendVerificationEmail(newState)
        if (data.ok === 0) {
          setLoading(false)
          return setError(data.error)
        }
        log.debug('skipping email verification?', { ...data, skip: Config.skipEmailVerification })
        if (Config.skipEmailVerification || data.onlyInEnv) {
          // Server is using onlyInEnv middleware (probably dev mode), email verification is not sent.

          // Skip EmailConfirmation screen
          nextRoute = navigation.state.routes[navigation.state.index + 2]

          // Set email as confirmed
          setState({ ...newState, isEmailConfirmed: true })
        } else {
          // if email is properly sent, persist current user's information to userStorage
          await userStorage.setProfile({ ...newState, walletAddress: goodWallet.account })
        }

        return navigateWithFocus(nextRoute.key)
      } catch (e) {
        log.error(e)
      }
    } else {
      if (nextRoute) {
        return navigateWithFocus(nextRoute.key)
      } else {
        log.info('Sending new user data', state)
        try {
          // After sending email to the user for confirmation (transition between Email -> EmailConfirmation)
          // user's profile is persisted (`userStorage.setProfile`).
          // Then, when the user access the application from the link (in EmailConfirmation), data is recovered and
          // saved to the `state`
          await API.addUser(state)
          // Stores creationBlock number into 'lastBlock' feed's node
          const creationBlock = (await goodWallet.getBlockNumber()).toString()
          await Promise.all([
            (saveProfile({ registered: true }),
            userStorage.setProfileField('registered', true),
            goodWallet
              .getBlockNumber()
              .then(creationBlock => userStorage.saveLastBlockNumber(creationBlock.toString())),
            AsyncStorage.getItem('GD_USER_MNEMONIC').then(mnemonic => API.sendRecoveryInstructionByEmail(mnemonic)))
          ])
          // top wallet of new user
          // wait for the topping to complete to be able to withdraw
          // await API.verifyTopWallet()
          userStorage.setProfileField('registered', true, 'public')
          navigation.navigate('AppNavigation')
          store.set('isLoggedIn')(true)
          // store.set('currentScreen')({ loading: false })
          setLoading(false)
        } catch (error) {
          log.error('New user failure', { error })
        }
      }
    }
  }

  const back = () => {
    const nextRoute = navigation.state.routes[navigation.state.index - 1]
    setError()
    if (nextRoute) {
      navigateWithFocus(nextRoute.key)
    } else {
      navigation.navigate('Auth')
    }
  }

  return (
    <View style={styles.container}>
      <NavBar goBack={back} title={'Sign Up'} />
      <ScrollView contentContainerStyle={scrollableContainer}>
        <View style={styles.contentContainer}>
          <SignupWizardNavigator
            navigation={navigation}
            screenProps={{ ...screenProps, error, data: { ...state, loading }, doneCallback: done, back: back }}
          />
        </View>
      </ScrollView>
    </View>
  )
}

Signup.router = SignupWizardNavigator.router
Signup.navigationOptions = SignupWizardNavigator.navigationOptions

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { justifyContent: 'center', flexDirection: 'row', flex: 1 }
})

export default Signup
