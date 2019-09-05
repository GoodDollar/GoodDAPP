// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage, ScrollView, StyleSheet, View } from 'react-native'
import { createSwitchNavigator } from '@react-navigation/core'
import { isMobileSafari } from 'mobile-device-detect'
import { GD_USER_MNEMONIC, IS_LOGGED_IN } from '../../lib/constants/localStorage'

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
    SignupCompleted,
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
      mobile: '',
    }),
    smsValidated: false,
    isEmailConfirmed: false,
    jwt: '',
  }
  const [ready, setReady]: [Ready, ((Ready => Ready) | Ready) => void] = useState()
  const [state, setState] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [countryCode, setCountryCode] = useState(undefined)
  const [createError, setCreateError] = useState(false)
  const [finishedPromise, setFinishedPromise] = useState(undefined)

  const [showErrorDialog] = useErrorDialog()
  const shouldGrow = store.get && !store.get('isMobileSafariKeyboardShown')
  const navigateWithFocus = (routeKey: string) => {
    navigation.navigate(routeKey)
    setLoading(false)
    if (isMobileSafari || routeKey === 'Phone') {
      setTimeout(() => {
        const el = document.getElementById(routeKey + '_input')
        if (el) {
          el.focus()
        }
      }, 300)
    }
  }
  const fireSignupEvent = (event?: string) => {
    let curRoute = navigation.state.routes[navigation.state.index]
    fireEvent(`SIGNUP_${event || curRoute.key}`)
  }

  const getCountryCode = async () => {
    try {
      const { data } = await API.getLocation()
      data && setCountryCode(data.country)
    } catch (e) {
      log.error('Could not get user location', e.message, e)
    }
  }
  useEffect(() => {
    //get user country code for phone
    getCountryCode()

    //lazy login in background
    const ready = (async () => {
      log.debug('ready: Starting initialization')
      const { init } = await import('../../init')
      const login = import('../../lib/login/GoodWalletLogin')
      const { goodWallet, userStorage } = await init()

      //for QA
      global.wallet = goodWallet
      initAnalytics(goodWallet, userStorage).then(_ => fireSignupEvent('STARTED'))

      //the login also re-initialize the api with new jwt
      await login.then(l => l.default.auth())
      await API.ready

      //now that we are loggedin, reload api with JWT
      // await API.init()
      log.debug('ready: finished initialization')
      return { goodWallet, userStorage }
    })()
    setReady(ready)

    //don't allow to start signup flow not from begining
    if (navigation.state.index > 0) {
      log.debug('redirecting to start, got index:', navigation.state.index)
      setLoading(true)
      return navigateWithFocus(navigation.state.routes[0].key)
    }
  }, [])

  const finishRegistration = async () => {
    setCreateError(false)
    setLoading(true)

    log.info('Sending new user data', state)
    try {
      const { goodWallet, userStorage } = await ready

      // TODO: this comment is incorrect until we restore email verificaiton requirement
      // After sending email to the user for confirmation (transition between Email -> EmailConfirmation)
      // user's profile is persisted (`userStorage.setProfile`).
      // Then, when the user access the application from the link (in EmailConfirmation), data is recovered and
      // saved to the `state`

      //first need to add user to our database
      // Stores creationBlock number into 'lastBlock' feed's node

      const addUserAPIPromise = API.addUser(state)
        .then(res => {
          const data = res.data

          if (data && data.loginToken) {
            userStorage.setProfileField('loginToken', data.loginToken, 'private')
          }
        })
        .catch(e => {
          log.error(e.message, e)
        })

      await Promise.all([
        addUserAPIPromise,
        userStorage.setProfile({ ...state, walletAddress: goodWallet.account }),
        userStorage.setProfileField('registered', true, 'public'),
        goodWallet.getBlockNumber().then(creationBlock => userStorage.saveLastBlockNumber(creationBlock.toString())),
      ])

      //need to wait for API.addUser but we dont need to wait for it to finish
      AsyncStorage.getItem(GD_USER_MNEMONIC).then(mnemonic => API.sendRecoveryInstructionByEmail(mnemonic)),
        await AsyncStorage.setItem(IS_LOGGED_IN, true)
      log.debug('New user created')
      return true
    } catch (e) {
      log.error('New user failure', e.message, e)
      showErrorDialog('New user creation failed, please go back and try again', e)
      setCreateError(true)
      return false
    } finally {
      setLoading(false)
    }
  }
  const done = async (data: { [string]: string }) => {
    setLoading(true)
    fireSignupEvent()
    let nextRoute = navigation.state.routes[navigation.state.index + 1]
    const newState = { ...state, ...data }
    setState(newState)
    log.info('signup data:', { data, nextRoute })

    if (nextRoute && nextRoute.key === 'SMS') {
      try {
        let { data } = await API.sendOTP(newState)
        if (data.ok === 0) {
          return showErrorDialog('Sending mobile verification code failed', data.error)
        }
        return navigateWithFocus(nextRoute.key)
      } catch (e) {
        log.error(e.message, e)
        showErrorDialog('Sending mobile verification code failed', e)
      } finally {
        setLoading(false)
      }
    } else if (nextRoute && nextRoute.key === 'EmailConfirmation') {
      try {
        const { data } = await API.sendVerificationEmail(newState)
        if (data.ok === 0) {
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
        return navigateWithFocus(nextRoute.key)
      } catch (e) {
        log.error(e.message, e)
        showErrorDialog('Email verification failed', e)
      } finally {
        setLoading(false)
      }
    } else if (nextRoute) {
      return navigateWithFocus(nextRoute.key)
    }

    const ok = await finishedPromise
    log.debug('user registration synced and completed', { ok })

    //tell App.js we are done here so RouterSelector switches router
    if (ok) {
      store.set('isLoggedIn')(true)
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

  useEffect(() => {
    const curRoute = navigation.state.routes[navigation.state.index]
    if (state === initialState) {
      return
    }
    if (curRoute && curRoute.key === 'SignupCompleted') {
      const finishedPromise = finishRegistration()
      setFinishedPromise(finishedPromise)
    }
  }, [navigation.state.index])

  const { scrollableContainer, contentContainer } = styles

  return (
    <View style={{ flexGrow: shouldGrow ? 1 : 0 }}>
      <NavBar goBack={back} title={'Sign Up'} />
      <ScrollView contentContainerStyle={scrollableContainer}>
        <View style={contentContainer}>
          <SignupWizardNavigator
            navigation={navigation}
            screenProps={{
              ...screenProps,
              data: { ...state, loading, createError, countryCode },
              doneCallback: done,
              back,
            }}
          />
        </View>
      </ScrollView>
    </View>
  )
}

Signup.router = SignupWizardNavigator.router
Signup.navigationOptions = SignupWizardNavigator.navigationOptions

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scrollableContainer: {
    flexGrow: 1,
  },
})

export default Signup
