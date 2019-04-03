// @flow
import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
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

export type SignupState = UserRecord & SMSRecord

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
    pubkey: goodWallet.account,
    smsValidated: false,
    isEmailConfirmed: false,
    jwt: ''
  }

  const [state, setState] = useState(initialState)
  const store = GDStore.useStore()
  const { loading } = store.get('currentScreen')
  function saveProfile() {
    userStorage.setProfile(state)
  }

  const done = async (data: { [string]: string }) => {
    log.info('signup data:', { data })
    setState({ ...state, ...data })
    console.log({ state, data })
    let nextRoute = navigation.state.routes[navigation.state.index + 1]
    if (nextRoute && nextRoute.key === 'SMS') {
      try {
        await API.sendOTP({ ...state, ...data })
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
          await API.addUser(state)
          await API.verifyUser({})
          const destinationPath = store.get('destinationPath')
          store.set('isLoggedInCitizen')(true)

          if (destinationPath !== '') {
            store.set('destinationPath')('')
            // top wallet of new user
            // wait for the topping to complete to be able to withdraw
            await API.verifyTopWallet()
            navigation.navigate(JSON.parse(destinationPath))
          } else {
            //top wallet of new user
            API.verifyTopWallet()
            navigation.navigate('AppNavigation')
          }
        } catch (error) {
          console.log({ error })
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
      <View style={styles.contentContainer}>
        <SignupWizardNavigator
          navigation={navigation}
          screenProps={{ ...screenProps, data: { ...state, loading }, doneCallback: done, back: back }}
        />
      </View>
    </View>
  )
}
Signup.router = SignupWizardNavigator.router
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { justifyContent: 'center', flexDirection: 'row', flex: 1 }
})

export default Signup
