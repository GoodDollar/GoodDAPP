// @flow
import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import NameForm from './NameForm'
import EmailForm from './EmailForm'
import PhoneForm from './PhoneForm'
import SmsForm from './SmsForm'
import EmailConfirmation from './EmailConfirmation'
import FaceRecognition from './FaceRecognition'
import SignupCompleted from './SignupCompleted'
import NavBar from '../appNavigation/NavBar'

import { createSwitchNavigator } from '@react-navigation/core'
import logger from '../../lib/logger/pino-logger'

import { useWrappedApi } from '../../lib/API/useWrappedApi'
import goodWallet from '../../lib/wallet/GoodWallet'
import userStorage from '../../lib/gundb/UserStorage'
import type { SMSRecord } from './SmsForm'
import GDStore from '../../lib/undux/GDStore'
import { getUserModel, type UserModel } from '../../lib/gundb/UserModel'

const log = logger.child({ from: 'SignupState' })

export type SignupState = UserModel & SMSRecord

const SignupWizardNavigator = createSwitchNavigator({
  Name: NameForm,
  Phone: PhoneForm,
  SMS: SmsForm,
  Email: EmailForm,
  EmailConfirmation,
  FaceRecognition,
  SignupCompleted
})

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
  const store = GDStore.useStore()
  const { loading } = store.get('currentScreen')

  function saveProfile() {
    userStorage.setProfile({ ...state, walletAddress: goodWallet.account })
  }

  const done = async (data: { [string]: string }) => {
    log.info('signup data:', { data })
    let nextRoute = navigation.state.routes[navigation.state.index + 1]
    const newState = { ...state, ...data }
    setState(newState)

    if (nextRoute && nextRoute.key === 'SMS') {
      try {
        await API.sendOTP(newState)
        navigation.navigate(nextRoute.key)
      } catch (e) {
        log.error(e)
      }
    } else if (nextRoute && nextRoute.key === 'EmailConfirmation') {
      try {
        const verificationResponse = await API.sendVerificationEmail(newState)

        if (verificationResponse.data.onlyInEnv) {
          // Server is using onlyInEnv middleware (probably dev mode), email verification is not sent.
          log.debug({ ...verificationResponse.data })

          // Skip EmailConfirmation screen
          nextRoute = navigation.state.routes[navigation.state.index + 2]

          // Set email as confirmed
          setState({ ...newState, isEmailConfirmed: true })
        } else {
          // if email is properly sent, persist current user's information to userStorage
          await userStorage.setProfile({ ...newState, walletAddress: goodWallet.account })
        }

        navigation.navigate(nextRoute.key)
      } catch (e) {
        log.error(e)
      }
    } else {
      if (nextRoute) {
        navigation.navigate(nextRoute.key)
      } else {
        log.info('Sending new user data', state)
        saveProfile()
        try {
          // After sending email to the user for confirmation (transition between Email -> EmailConfirmation)
          // user's profile is persisted (`userStorage.setProfile`).
          // Then, when the user access the application from the link (in EmailConfirmation), data is recovered and
          // saved to the `state`
          await API.addUser(state)
          await API.verifyUser({})
          const destinationPath = store.get('destinationPath')
          store.set('isLoggedInCitizen')(true)
          // top wallet of new user
          // wait for the topping to complete to be able to withdraw
          await API.verifyTopWallet()
          const mnemonic = localStorage.getItem('GD_USER_MNEMONIC')
          await API.sendRecoveryInstructionByEmail(mnemonic)
          if (destinationPath !== '') {
            navigation.navigate(JSON.parse(destinationPath))
            store.set('destinationPath')('')
          } else {
            navigation.navigate('AppNavigation')
          }
        } catch (error) {
          log.error('New user failure', { error })
        }
      }
    }
  }

  const back = () => {
    const nextRoute = navigation.state.routes[navigation.state.index - 1]

    if (nextRoute) {
      navigation.navigate(nextRoute.key)
    } else {
      navigation.navigate('Auth')
    }
  }

  return (
    <View style={styles.container}>
      <NavBar goBack={back} title={'Sign Up'} />
      <ScrollView contentContainerStyle={{ minHeight: '100%' }}>
        <View style={styles.contentContainer}>
          <SignupWizardNavigator
            navigation={navigation}
            screenProps={{ ...screenProps, data: { ...state, loading }, doneCallback: done, back: back }}
          />
        </View>
      </ScrollView>
    </View>
  )
}
Signup.router = SignupWizardNavigator.router
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { justifyContent: 'center', flexDirection: 'row', flex: 1 }
})

export default Signup
