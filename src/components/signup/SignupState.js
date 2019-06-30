// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage, ScrollView, StyleSheet, View } from 'react-native'
import { createSwitchNavigator } from '@react-navigation/core'
import { scrollableContainer } from '../common/styles'
import NavBar from '../appNavigation/NavBar'
import { navigationConfig } from '../appNavigation/navigationConfig'
import logger from '../../lib/logger/pino-logger'

import API from '../../lib/API/api'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'

import { getUserModel, type UserModel } from '../../lib/gundb/UserModel'
import { fireEvent, initAnalytics } from '../../lib/analytics/analytics'
import Config from '../../config/config'
import type { SMSRecord } from './SmsForm'
import SignupCompleted from './SignupCompleted'
import EmailConfirmation from './EmailConfirmation'
import SmsForm from './SmsForm'
import PhoneForm from './PhoneForm'
import EmailForm from './EmailForm'
import NameForm from './NameForm'

const log = logger.child({ from: 'SignupState' })

export type SignupState = UserModel & SMSRecord
type Ready = Promise<{ goodWallet: any, userStorage: any }>
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

const Signup = ({ navigation, screenProps }: { navigation: any, screenProps: any }) => {
  const store = SimpleStore.useStore()

  // const API = useWrappedApi()
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
  const [ready, setReady]: [Ready, ((Ready => Ready) | Ready) => void] = useState(Promise.resolve({}))
  const [state, setState] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [showErrorDialog] = useErrorDialog()

  const navigateWithFocus = (routeKey: string) => {
    navigation.navigate(routeKey)
    setLoading(false)
    setTimeout(() => {
      const el = document.getElementById(routeKey + '_input')
      if (el) {
        el.focus()
      }
    }, 300)
  }
  const fireSignupEvent = (event?: string) => {
    let curRoute = navigation.state.routes[navigation.state.index]
    fireEvent(`SIGNUP_${event || curRoute.key}`)
  }

  useEffect(() => {
    //don't allow to start signup flow not from begining
    if (navigation.state.index > 0) {
      log.debug('redirecting to start, got index:', navigation.state.index)
      setLoading(true)
      return navigateWithFocus(navigation.state.routes[0].key)
    }

    //lazy login in background
    const ready = (async () => {
      log.debug('ready: Starting initialization')
      const { init } = await import('../../init')
      const login = import('../../lib/login/GoodWalletLogin')
      const { goodWallet, userStorage } = await init()
      initAnalytics(goodWallet, userStorage).then(_ => fireSignupEvent('STARTED'))
      await login.then(l => l.default.auth())

      //now that we are loggedin, reload api with JWT
      await API.init()
      return { goodWallet, userStorage }
    })()
    setReady(ready)
  }, [])
  const done = async (data: { [string]: string }) => {
    setLoading(true)
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
          return showErrorDialog('Sending mobile verification code failed', data.error)
        }
        return navigateWithFocus(nextRoute.key)
      } catch (e) {
        log.error(e)
        showErrorDialog('Sending mobile verification code failed', e)
        setLoading(false)
      }
    } else if (nextRoute && nextRoute.key === 'EmailConfirmation') {
      try {
        const { data } = await API.sendVerificationEmail(newState)
        if (data.ok === 0) {
          setLoading(false)
          return showErrorDialog('Failed sending verificaiton email', data.error)
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
          // await userStorage.setProfile({ ...newState, walletAddress: goodWallet.account })
        }
        setLoading(false)
        return navigateWithFocus(nextRoute.key)
      } catch (e) {
        log.error(e)
        showErrorDialog('Email verification failed', e)
        setLoading(false)
      }
    } else {
      if (nextRoute) {
        setLoading(false)
        return navigateWithFocus(nextRoute.key)
      }
      log.info('Sending new user data', state)
      try {
        const { goodWallet, userStorage } = await ready

        // After sending email to the user for confirmation (transition between Email -> EmailConfirmation)
        // user's profile is persisted (`userStorage.setProfile`).
        // Then, when the user access the application from the link (in EmailConfirmation), data is recovered and
        // saved to the `state`
        await API.addUser(state)

        // Stores creationBlock number into 'lastBlock' feed's node
        await Promise.all([
          userStorage.setProfile({ ...state, walletAddress: goodWallet.account }),
          userStorage.setProfileField('registered', true, 'public'),
          goodWallet.getBlockNumber().then(creationBlock => userStorage.saveLastBlockNumber(creationBlock.toString())),
          AsyncStorage.getItem('GD_USER_MNEMONIC').then(mnemonic => API.sendRecoveryInstructionByEmail(mnemonic)),
          AsyncStorage.setItem('GOODDAPP_isLoggedIn', true)
        ])

        //tell App.js we are done here so RouterSelector switches router
        store.set('isLoggedIn')(true)
      } catch (e) {
        log.error('New user failure', { e, message: e.message })
        showErrorDialog('New user creation failed', e)
        setLoading(false)
      }
    }
  }

  const back = () => {
    const nextRoute = navigation.state.routes[navigation.state.index - 1]
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
            screenProps={{ ...screenProps, data: { ...state, loading }, doneCallback: done, back: back }}
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
