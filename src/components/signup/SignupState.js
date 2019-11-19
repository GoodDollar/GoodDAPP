// @flow
import React, { useEffect, useState } from 'react'
import { AsyncStorage, ScrollView, StyleSheet, View } from 'react-native'
import { createSwitchNavigator } from '@react-navigation/core'
import { isMobileSafari } from 'mobile-device-detect'
import _get from 'lodash/get'
import { GD_USER_MNEMONIC, IS_LOGGED_IN } from '../../lib/constants/localStorage'
import NavBar from '../appNavigation/NavBar'
import { navigationConfig } from '../appNavigation/navigationConfig'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import { showSupportDialog } from '../common/dialogs/showSupportDialog'
import { getUserModel, type UserModel } from '../../lib/gundb/UserModel'
import Config from '../../config/config'
import { fireEvent } from '../../lib/analytics/analytics'
import LoadingIcon from '../common/modal/LoadingIcon'
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
    MagicLinkInfo,
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
  const [loadingMandatoryData, setLoadingMAndatoryData] = useState(false)
  const [countryCode, setCountryCode] = useState(undefined)
  const [createError, setCreateError] = useState(false)
  const [finishedPromise, setFinishedPromise] = useState(undefined)
  const [showNavBarGoBackButton, setShowNavBarGoBackButton] = useState(true)
  const [registerAllowed, setRegisterAllowed] = useState(false)

  const [, hideDialog, showErrorDialog] = useDialog()
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

  const getW3UserFromProps = async () => {
    const web3Token = await AsyncStorage.getItem('GD_web3Token')

    // Getting the second element from routes array (starts from 0) as the second route is Phone
    // We are redirecting directly to Phone from Auth component if w3Token provided
    const _w3User = _get(navigation, 'state.routes[1].params.w3User')
    let w3User = _w3User && typeof _w3User === 'object' ? _w3User : {}

    if (web3Token && Object.keys(w3User).length) {
      const userScreenData = {
        email: w3User.email || '',
        fullName: w3User.full_name || '',
        w3Token: web3Token,
        skipEmail: !!w3User.email,
        skipEmailConfirmation: !!w3User.email,
      }

      setState({
        ...state,
        ...userScreenData,
      })
    }
  }

  const checkWeb3Token = async () => {
    setLoadingMAndatoryData(true)

    const web3Token = await AsyncStorage.getItem('GD_web3Token')

    // Getting the second element from routes array (starts from 0) as the second route is Phone
    // We are redirecting directly to Phone from Auth component if w3Token provided
    const _w3UserFromProps = _get(navigation, 'state.routes[1].params.w3User')
    let w3UserFromProps = _w3UserFromProps && typeof _w3UserFromProps === 'object' ? _w3UserFromProps : {}

    if (!web3Token || Object.keys(w3UserFromProps).length) {
      setLoadingMAndatoryData(false)
      return
    }

    let behaviour = ''
    let w3User

    await API.ready

    try {
      const w3userData = await API.getUserFromW3ByToken(web3Token)

      w3User = w3userData.data
    } catch (e) {
      behaviour = 'showTokenError'
    }

    if (!behaviour) {
      if (w3User.has_wallet) {
        behaviour = 'goToSignInScreen'
      } else {
        behaviour = 'goToPhone'
      }
    }

    log.info('behaviour', behaviour)

    const userScreenData = {
      email: w3User.email || '',
      fullName: w3User.full_name || '',
      w3Token: web3Token,
      skipEmail: !!w3User.email,
      skipEmailConfirmation: !!w3User.email,
    }

    switch (behaviour) {
      case 'showTokenError':
        navigation.navigate('InvalidW3TokenError')
        break

      case 'goToSignInScreen':
        navigation.navigate('SigninInfo')
        break

      case 'goToPhone':
        try {
          await API.checkWeb3Email({
            email: w3User.email,
            token: web3Token,
          })
        } catch (e) {
          log.error('W3 Email verification failed', e.message, e)
          return navigation.navigate('InvalidW3TokenError')

          // showErrorDialog('Email verification failed', e)
        }

        if (w3User.image) {
          userScreenData.avatar = await API.getBase64FromImageUrl(w3User.image).catch(e => {
            log.error('Fetch base 64 from image uri failed', e.message, e)
          })
        }

        setState({
          ...state,
          ...userScreenData,
        })

        navigation.navigate('Phone')
        break

      default:
        break
    }

    setLoadingMAndatoryData(false)
  }

  const isRegisterAllowed = async () => {
    const w3Token = await AsyncStorage.getItem('GD_web3Token')
    const destinationPath = await AsyncStorage.getItem('GD_destinationPath')
      .then(JSON.parse)
      .catch(e => ({}))
    const paymentCode = _get(destinationPath, 'params.paymentCode')

    if (paymentCode || w3Token) {
      return setRegisterAllowed(true)
    }

    navigation.navigate('Login')
  }

  useEffect(() => {
    isRegisterAllowed()

    getW3UserFromProps()
    checkWeb3Token()

    //get user country code for phone
    getCountryCode()

    //lazy login in background
    const ready = (async () => {
      log.debug('ready: Starting initialization')
      const { init } = await import('../../init')
      const login = import('../../lib/login/GoodWalletLogin')
      const { goodWallet, userStorage, source } = await init()

      //for QA
      global.wallet = goodWallet
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

    // don't allow to start sign up flow not from begining except when w3Token provided
    AsyncStorage.getItem('GD_web3Token').then(token => {
      if (!token && navigation.state.index > 0) {
        log.debug('redirecting to start, got index:', navigation.state.index)
        setLoading(true)
        return navigateWithFocus(navigation.state.routes[0].key)
      }
    })
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
        AsyncStorage.removeItem('GD_web3Token'),
        w3Token &&
          API.updateW3UserWithWallet(w3Token, goodWallet.account).catch(e =>
            log.error('failed updateW3UserWithWallet', e.message, e)
          ),
        API.sendMagicLinkByEmail(userStorage.getMagicLink()).catch(e =>
          log.error('failed sendMagicLinkByEmail', e.message, e)
        ),
      ])
      await AsyncStorage.setItem(IS_LOGGED_IN, true)
      log.debug('New user created')
      return true
    } catch (e) {
      log.error('New user failure', e.message, e)
      showSupportDialog(showErrorDialog, hideDialog, screenProps)

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

    log.info('signup data:', { data })

    let nextRoute = getNextRoute(navigation.state.routes, navigation.state.index, state)

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
        log.error('Send mobile code failed', e.message, e)
        return showErrorDialog('Could not send verification code. Please try again')
      } finally {
        setLoading(false)
      }
    } else if (nextRoute && nextRoute.key === 'EmailConfirmation') {
      try {
        if (state.w3Token) {
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
      setShowNavBarGoBackButton(false)
    }

    if (curRoute && curRoute.key === 'SignupCompleted') {
      const finishedPromise = finishRegistration()
      setFinishedPromise(finishedPromise)
    }
  }, [navigation.state.index])

  const { scrollableContainer, contentContainer } = styles

  return registerAllowed ? (
    <View style={{ flexGrow: shouldGrow ? 1 : 0 }}>
      <NavBar goBack={showNavBarGoBackButton ? back : undefined} title={'Sign Up'} />
      <ScrollView contentContainerStyle={scrollableContainer}>
        <View style={contentContainer}>
          {loadingMandatoryData ? (
            <LoadingIcon style={styles.loadingMargin} />
          ) : (
            <SignupWizardNavigator
              navigation={navigation}
              screenProps={{
                ...screenProps,
                data: { ...state, loading, createError, countryCode },
                doneCallback: done,
                back,
              }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  ) : null
}

Signup.router = SignupWizardNavigator.router
Signup.navigationOptions = SignupWizardNavigator.navigationOptions

const styles = StyleSheet.create({
  loadingMargin: {
    margin: 'auto',
    marginBottom: 'auto',
  },
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
