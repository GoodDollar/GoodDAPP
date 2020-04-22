// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { createSwitchNavigator } from '@react-navigation/core'
import { get } from 'lodash'
import { isMobileSafari } from '../../lib/utils/platform'
import { GD_USER_MNEMONIC, IS_LOGGED_IN } from '../../lib/constants/localStorage'
import NavBar from '../appNavigation/NavBar'
import { navigationConfig } from '../appNavigation/navigationConfig'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import BackButtonHandler from '../../lib/utils/handleBackButton'
import retryImport from '../../lib/utils/retryImport'
import { showSupportDialog } from '../common/dialogs/showSupportDialog'
import { getUserModel, type UserModel } from '../../lib/gundb/UserModel'
import Config from '../../config/config'
import { fireEvent } from '../../lib/analytics/analytics'
import type { SMSRecord } from './SmsForm'
import SignupCompleted from './SignupCompleted'
import EmailConfirmation from './EmailConfirmation'
import SmsForm from './SmsForm'
import PhoneForm from './PhoneForm'
import EmailForm from './EmailForm'
import NameForm from './NameForm'
import MagicLinkInfo from './MagicLinkInfo'

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
    MagicLinkInfo,
  },
  navigationConfig
)

const Signup = ({ navigation }: { navigation: any, screenProps: any }) => {
  const store = SimpleStore.useStore()

  // Getting the second element from routes array (starts from 0) as the second route is Phone
  // We are redirecting directly to Phone from Auth component if w3Token provided
  const _w3UserFromProps = get(navigation, 'state.routes[1].params.w3User', {})
  const w3Token = get(navigation, 'state.routes[1].params.w3Token')
  const w3UserFromProps = _w3UserFromProps && typeof _w3UserFromProps === 'object' ? _w3UserFromProps : {}

  const initialState: SignupState = {
    ...getUserModel({
      email: w3UserFromProps.email || '',
      fullName: w3UserFromProps.full_name || '',
      mobile: '',
    }),
    smsValidated: false,
    isEmailConfirmed: false,
    jwt: '',
    skipEmail: !!w3UserFromProps.email,
    skipEmailConfirmation: !!w3UserFromProps.email,
    w3Token,
  }
  const [ready, setReady]: [Ready, ((Ready => Ready) | Ready) => void] = useState()
  const [state, setState] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [countryCode, setCountryCode] = useState(undefined)
  const [createError, setCreateError] = useState(false)
  const [showNavBarGoBackButton, setShowNavBarGoBackButton] = useState(true)
  const [finishedPromise, setFinishedPromise] = useState(undefined)
  const [title, setTitle] = useState('Sign Up')
  const [, hideDialog, showErrorDialog] = useDialog()
  const shouldGrow = store.get && !store.get('isMobileSafariKeyboardShown')

  const navigateWithFocus = (routeKey: string) => {
    navigation.navigate(routeKey)
    setLoading(false)

    if (Platform.OS === 'web' && (isMobileSafari || routeKey === 'Phone')) {
      setTimeout(() => {
        const el = document.getElementById(routeKey + '_input')
        if (el) {
          el.focus()
        }
      }, 300)
    }
  }

  const fireSignupEvent = (event?: string, data) => {
    let curRoute = navigation.state.routes[navigation.state.index]

    fireEvent(`SIGNUP_${event || curRoute.key}`, data)
  }

  const getCountryCode = async () => {
    try {
      const { data } = await API.getLocation()
      data && setCountryCode(data.country)
    } catch (e) {
      log.error('Could not get user location', e.message, e)
    }
  }

  const verifyW3Email = async (email, web3Token) => {
    try {
      const res = await API.checkWeb3Email({
        email,
        token: web3Token,
      })
      log.debug('verified w3 email', res)
    } catch (e) {
      log.error('W3 Email verification failed', e.message, e)
      return navigation.navigate('InvalidW3TokenError')

      // showErrorDialog('Email verification failed', e)
    }
  }

  const checkWeb3Token = async () => {
    let w3Token
    try {
      w3Token = await AsyncStorage.getItem('GD_web3Token')
      if (!w3Token) {
        return
      }

      let w3User = w3UserFromProps
      log.info('from props:', { w3User })
      if (w3User.email === undefined) {
        store.set('loadingIndicator')({ loading: true })
        await API.ready

        try {
          const w3userData = await API.getUserFromW3ByToken(w3Token)

          w3User = w3userData.data
          log.info({ w3User })

          const userScreenData = {
            email: w3User.email || '',
            fullName: w3User.full_name || '',
            w3Token,
            skipEmail: !!w3User.email,
            skipEmailConfirmation: !!w3User.email,
          }
          setState({
            ...state,
            ...userScreenData,
          })
        } catch (e) {
          log.warn('could not get user data from w3', w3Token)
          return
        }
      }
    } catch (e) {
      log.error('unexpected error in checkWeb3Token', e.message, e, { w3Token })
    } finally {
      store.set('loadingIndicator')({ loading: false })
    }
  }

  const onMount = async () => {
    //get user country code for phone
    //read user data from w3 if needed
    await Promise.all([getCountryCode(), checkWeb3Token()])

    //lazy login in background
    const ready = (async () => {
      log.debug('ready: Starting initialization')
      const { init } = await retryImport(() => import('../../init'))
      const login = retryImport(() => import('../../lib/login/GoodWalletLogin'))
      const { goodWallet, userStorage, source } = await init()

      //for QA
      global.wallet = goodWallet
      await userStorage.ready
      fireSignupEvent('STARTED', { source })

      //the login also re-initialize the api with new jwt
      await login
        .then(l => l.default.auth())
        .catch(e => {
          log.error('failed auth:', e.message, e)

          // showErrorDialog('Failed authenticating with server', e)
        })
      await API.ready

      //now that we are loggedin, reload api with JWT
      // await API.init()
      return { goodWallet, userStorage }
    })()

    setReady(ready)
  }
  useEffect(() => {
    // don't allow to start sign up flow not from begining except when w3Token provided
    AsyncStorage.getItem('GD_web3Token').then(token => {
      log.debug('redirecting to start, got index:', navigation.state.index)

      if (token && navigation.state.index > 1) {
        setLoading(true)
        return navigateWithFocus(navigation.state.routes[1].key)
      }

      if (!token && navigation.state.index > 0) {
        setLoading(true)
        return navigateWithFocus(navigation.state.routes[0].key)
      }
    })

    onMount()
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

      const { skipEmail, skipEmailConfirmation, ...requestPayload } = state

      //first need to add user to our database
      // Stores creationBlock number into 'lastBlock' feed's node

      let w3Token = requestPayload.w3Token

      if (w3Token) {
        userStorage.userProperties.set('cameFromW3Site', true)
      }

      const mnemonic = await AsyncStorage.getItem(GD_USER_MNEMONIC)
      await Promise.all([
        userStorage.setProfile({ ...requestPayload, walletAddress: goodWallet.account, mnemonic }).catch(_ => _),
        userStorage.setProfileField('registered', true, 'public').catch(_ => _),
      ])

      const addUserAPIPromise = API.addUser(requestPayload).then(res => {
        const data = res.data

        if (data && data.loginToken) {
          userStorage.setProfileField('loginToken', data.loginToken, 'private').catch()
        }

        if (data && data.w3Token) {
          userStorage.setProfileField('w3Token', data.w3Token, 'private').catch()
          w3Token = data.w3Token
        }

        if (data && data.marketToken) {
          userStorage.setProfileField('marketToken', data.marketToken, 'private').catch()
        }
      })

      await addUserAPIPromise

      goodWallet
        .getBlockNumber()
        .then(creationBlock => userStorage.saveLastBlockNumber(creationBlock.toString()))
        .catch(e => log.error('save blocknumber failed:', e.message, e))

      //need to wait for API.addUser but we dont need to wait for it to finish
      Promise.all([
        w3Token &&
          API.updateW3UserWithWallet(w3Token, goodWallet.account).catch(e =>
            log.error('failed updateW3UserWithWallet', e.message, e)
          ),
      ])

      await AsyncStorage.setItem(IS_LOGGED_IN, 'true')

      AsyncStorage.removeItem('GD_web3Token')

      log.debug('New user created')
      setLoading(false)
      return true
    } catch (e) {
      log.error('New user failure', e.message, e)
      showSupportDialog(showErrorDialog, hideDialog, navigation.navigate)

      // showErrorDialog('Something went on our side. Please try again')
      setCreateError(true)
      return false
    } finally {
      setLoading(false)
    }
  }

  function getNextRoute(routes, routeIndex, state) {
    let nextRoute = routes[routeIndex + 1]

    if (state[`skip${nextRoute && nextRoute.key}`]) {
      return getNextRoute(routes, routeIndex + 1, state)
    }

    return nextRoute
  }

  function getCurrentRoute(routes, routeIndex) {
    return routes[routeIndex]
  }

  function getPrevRoute(routes, routeIndex, state) {
    let prevRoute = routes[routeIndex - 1]

    if (state[`skip${prevRoute && prevRoute.key}`]) {
      return getPrevRoute(routes, routeIndex - 1, state)
    }

    return prevRoute
  }

  const done = async (data: { [string]: string }) => {
    setLoading(true)
    fireSignupEvent()

    //We can wait for ready later, when we need stuff, we dont need it until usage of API first in sendOTP(that needs to be logged in)
    //and finally in finishRegistration
    // await ready

    log.info('signup data:', { data })

    let nextRoute = getNextRoute(navigation.state.routes, navigation.state.index, state)
    let currentRoute = getCurrentRoute(navigation.state.routes, navigation.state.index)

    const newState = { ...state, ...data }
    setState(newState)
    log.info('signup data:', { data, nextRoute, newState })

    if (currentRoute.key === 'MagicLinkInfo') {
      //this will cause a re-render and move user to the dashboard route
      store.set('isLoggedIn')(true)
    } else if (nextRoute && nextRoute.key === 'SMS') {
      try {
        //verify web3 email here
        if (newState.w3Token && newState.email) {
          await verifyW3Email(newState.email, newState.w3Token)
        }

        //we need API to be logged in, so we await for ready
        await ready
        let { data } = await API.sendOTP(newState)
        if (data.ok === 0) {
          const errorMessage =
            data.error === 'mobile_already_exists' ? 'Mobile already exists, please use a different one' : data.error

          return showSupportDialog(showErrorDialog, hideDialog, navigation.navigate, errorMessage)
        }
        return navigateWithFocus(nextRoute.key)
      } catch (e) {
        log.error('Send mobile code failed', e.message, e)
        return showErrorDialog('Could not send verification code. Please try again')
      } finally {
        setLoading(false)
      }
    } else if (nextRoute && nextRoute.key === 'EmailConfirmation') {
      try {
        if (newState.w3Token) {
          // Skip EmailConfirmation screen
          nextRoute = navigation.state.routes[navigation.state.index + 2]

          // Set email as confirmed
          setState({ ...newState, isEmailConfirmed: true })

          return
        }

        const { data } = await API.sendVerificationEmail(newState)
        if (data.ok === 0) {
          return showErrorDialog('Could not send verification email. Please try again')
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
        log.error('email verification failed unexpected:', e.message, e)
        return showErrorDialog('Could not send verification email. Please try again', 'EMAIL-UNEXPECTED-1')
      } finally {
        setLoading(false)
      }
    } else if (nextRoute && nextRoute.key === 'MagicLinkInfo') {
      setLoading(true)
      let ok
      if (createError) {
        ok = await finishRegistration()
      } else {
        ok = await finishedPromise
      }

      log.debug('user registration synced and completed', { ok })

      if (ok) {
        const { userStorage } = await ready
        API.sendMagicLinkByEmail(userStorage.getMagicLink())
          .then(r => log.info('magiclink sent'))
          .catch(e => log.error('failed sendMagicLinkByEmail', e.message, e))
        return navigateWithFocus(nextRoute.key)
      }
    } else if (nextRoute) {
      return navigateWithFocus(nextRoute.key)
    }
  }

  const back = () => {
    const prevRoute = getPrevRoute(navigation.state.routes, navigation.state.index, state)

    if (prevRoute) {
      navigateWithFocus(prevRoute.key)
    } else {
      navigation.navigate('Auth')
    }
  }

  useEffect(() => {
    const curRoute = navigation.state.routes[navigation.state.index]

    if (state === initialState) {
      return
    }

    if (curRoute && curRoute.key === 'MagicLinkInfo') {
      setTitle('Magic Link')
      setShowNavBarGoBackButton(false)
    }
    if (curRoute && curRoute.key === 'SignupCompleted') {
      const finishedPromise = finishRegistration()
      setFinishedPromise(finishedPromise)
    }
  }, [navigation.state.index])

  useEffect(() => {
    const backButtonHandler = new BackButtonHandler({ defaultAction: back })
    return () => {
      backButtonHandler.unregister()
    }
  }, [back])

  const { scrollableContainer, contentContainer } = styles
  return (
    <View style={{ flexGrow: shouldGrow ? 1 : 0 }}>
      <NavBar goBack={showNavBarGoBackButton ? back : undefined} title={title} />
      <ScrollView contentContainerStyle={scrollableContainer}>
        <View style={contentContainer}>
          <SignupWizardNavigator
            navigation={navigation}
            screenProps={{
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
