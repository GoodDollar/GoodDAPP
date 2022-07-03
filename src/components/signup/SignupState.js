// @flow
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { createSwitchNavigator } from '@react-navigation/core'
import { assign, get, identity, isError, pick, pickBy, toPairs } from 'lodash'
import { defer, from as fromPromise } from 'rxjs'
import { retry } from 'rxjs/operators'
import moment from 'moment'

import { t } from '@lingui/macro'
import useCheckExisting from '../auth/hooks/useCheckExisting'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { isMobileSafari } from '../../lib/utils/platform'
import AuthContext from '../auth/context/AuthContext'
import {
  DESTINATION_PATH,
  GD_INITIAL_REG_METHOD,
  GD_USER_MNEMONIC,
  INVITE_CODE,
} from '../../lib/constants/localStorage'

import { REGISTRATION_METHOD_SELF_CUSTODY, REGISTRATION_METHOD_TORUS } from '../../lib/constants/login'
import NavBar from '../appNavigation/NavBar'
import AuthProgressBar from '../auth/components/AuthProgressBar'
import { navigationConfig } from '../appNavigation/navigationConfig'
import logger from '../../lib/logger/js-logger'
import { decorate, ExceptionCode } from '../../lib/exceptions/utils'
import API, { getException } from '../../lib/API'
import { useDialog } from '../../lib/dialog/useDialog'
import BackButtonHandler from '../appNavigation/BackButtonHandler'
import { showSupportDialog } from '../common/dialogs/showSupportDialog'
import { getUserModel, type UserModel } from '../../lib/userStorage/UserModel'
import Config from '../../config/config'
import { fireEvent, identifyOnUserSignup, identifyWith } from '../../lib/analytics/analytics'
import { parsePaymentLinkParams } from '../../lib/share'
import AuthStateWrapper from '../auth/components/AuthStateWrapper'
import { GoodWalletContext } from '../../lib/wallet/GoodWalletProvider'
import { GlobalTogglesContext } from '../../lib/contexts/togglesContext'
import type { SMSRecord } from './SmsForm'
import EmailConfirmation from './EmailConfirmation'
import SmsForm from './SmsForm'
import PhoneForm from './PhoneForm'
import EmailForm from './EmailForm'
import NameForm from './NameForm'

// import MagicLinkInfo from './MagicLinkInfo'
const log = logger.child({ from: 'SignupState' })

export type SignupState = UserModel & SMSRecord & { invite_code?: string }

type Ready = Promise<{ goodWallet: any, userStorage: any }>

const routes = {
  Name: NameForm,
  Phone: PhoneForm,
  SMS: SmsForm,
  Email: EmailForm,
  EmailConfirmation,
}

const requiredFields = ['fullName', 'email', Config.skipMobileVerification === false ? 'mobile' : null].filter(identity)

/**
 * check if user arrived with invite code
 */
const checkInviteCode = async () => {
  const destinationPath = await AsyncStorage.getItem(DESTINATION_PATH)
  const params = get(destinationPath, 'params')
  const paymentParams = params && parsePaymentLinkParams(params)

  //get inviteCode from url or from payment link
  return (
    (await AsyncStorage.getItem(INVITE_CODE)) ||
    get(destinationPath, 'params.inviteCode') ||
    get(paymentParams, 'inviteCode')
  )
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

const SignupWizardNavigator = createSwitchNavigator(routes, navigationConfig)

const Signup = ({ navigation }: { navigation: any, screenProps: any }) => {
  const torusUserFromProps =
    get(navigation, 'state.params.torusUser') ||
    get(navigation.state.routes.find(route => get(route, 'params.torusUser')), 'params.torusUser', {})

  const _regMethod =
    get(navigation, 'state.params.regMethod') ||
    get(navigation.state.routes.find(route => get(route, 'params.regMethod')), 'params.regMethod', undefined)

  const _torusProvider =
    get(navigation, 'state.params.torusProvider') ||
    get(navigation.state.routes.find(route => get(route, 'params.torusProvider')), 'params.torusProvider', undefined)

  const [regMethod] = useState(_regMethod)
  const [torusProvider] = useState(_torusProvider)
  const [torusUser] = useState(torusUserFromProps)
  const checkExisting = useCheckExisting(navigation)

  const isRegMethodSelfCustody = regMethod === REGISTRATION_METHOD_SELF_CUSTODY
  const skipEmail = !!torusUserFromProps.email
  const skipMobile = !!torusUserFromProps.mobile || Config.skipMobileVerification

  const initialSignupData: SignupState = {
    ...getUserModel({
      email: torusUserFromProps.email || '',
      fullName: torusUserFromProps.name || '',
      mobile: torusUserFromProps.mobile || '',
    }),
    smsValidated: false,
    isEmailConfirmed: skipEmail,
    skipEmail: skipEmail,
    skipPhone: skipMobile,
    skipSMS: skipMobile,
    skipEmailConfirmation: Config.skipEmailVerification || skipEmail,
    skipMagicLinkInfo: true, //isRegMethodSelfCustody === false,
  }

  const { goodWallet, userStorage, login: loginWithWallet, isLoggedInJWT } = useContext(GoodWalletContext)
  const { setLoggedInRouter, isMobileSafariKeyboardShown } = useContext(GlobalTogglesContext)
  const [ready, setReady]: [Ready, ((Ready => Ready) | Ready) => void] = useState()
  const [signupData, setSignupData] = useState(initialSignupData)
  const [countryCode, setCountryCode] = useState(undefined)
  const [createError, setCreateError] = useState(false)
  const [loading, setLoading] = useState(false)
  const { hideDialog, showErrorDialog } = useDialog()

  const { success: signupSuccess, setWalletPreparing, setSuccessfull, activeStep, setActiveStep } = useContext(
    AuthContext,
  )

  const navigateWithFocus = useCallback(
    (routeKey: string) => {
      navigation.navigate(routeKey)
      setLoading(false)

      if (Platform.OS === 'web' && (isMobileSafari || routeKey === 'Phone')) {
        setTimeout(() => {
          const el = document.getElementById(routeKey + '_input')

          el && el.focus()
        }, 300)
      }
    },
    [navigation],
  )

  const fireSignupEvent = useCallback(
    (event?: string, data) => {
      let curRoute = navigation.state.routes[navigation.state.index]

      fireEvent(`SIGNUP_${event || curRoute.key}`, data)
    },
    [navigation.state.routes, navigation.state.index],
  )

  const getCountryCode = useCallback(async () => {
    try {
      const data = await API.getLocation()
      const { country } = data || {}

      if (country) {
        setCountryCode(country)
      }
    } catch (e) {
      log.error('Could not get user location', e.message, e)
    }
  }, [setCountryCode])

  //keep privatekey from torus as master seed before initializing wallet
  //so wallet can use it, if torus is enabled and we don't have pkey then require re-login
  //this is true in case of refresh
  const checkTorusLogin = useCallback(() => {
    const masterSeed = torusUserFromProps.privateKey

    if (regMethod === REGISTRATION_METHOD_TORUS && masterSeed === undefined) {
      log.debug('torus user information missing', { torusUserFromProps })
      return navigation.navigate('Auth')
    }

    return !!masterSeed
  }, [torusUserFromProps, regMethod, navigation.navigate])

  //trigger finishRegistration
  useEffect(() => {
    if (goodWallet && userStorage && ready && signupData.finished) {
      finishRegistration(signupData).then(ok => ok & setSuccessfull(() => setLoggedInRouter(true)))
    }
  }, [goodWallet, userStorage, ready, signupData.finished, setLoggedInRouter])

  const finishRegistration = useCallback(
    async signupData => {
      const { skipEmail, skipEmailConfirmation, skipMagicLinkInfo, ...requestPayload } = signupData

      setCreateError(false)
      setActiveStep(3)
      setWalletPreparing(true)

      log.info('Sending new user data', { signupData, regMethod, torusProvider })

      try {
        const inviteCode = await checkInviteCode()

        log.debug('invite code:', { inviteCode })

        requiredFields.forEach(field => {
          if (!requestPayload[field]) {
            const fieldNames = { email: 'Email', fullName: 'Name', mobile: 'Mobile' }

            throw new Error(`Seems like you didn't fill your ${fieldNames[field]}`)
          }
        })

        if (inviteCode) {
          requestPayload.inviteCode = inviteCode
        }

        requestPayload.regMethod = regMethod

        let newUserData

        if (regMethod === REGISTRATION_METHOD_TORUS) {
          const { mobile, email, privateKey, accessToken, idToken } = torusUser

          // create proof that email/mobile is the same one verified by torus
          assign(requestPayload, {
            torusProvider,
            torusAccessToken: accessToken,
            torusIdToken: idToken,
          })

          if (torusProvider !== 'facebook') {
            // if logged in via other provider than facebook - generating & signing proof
            const torusProofNonce = await API.ping()
              .then(_ => moment(get(_, 'data.ping', Date.now())))
              .catch(e => moment())
              .then(_ => Math.max(Date.now(), _.valueOf()))

            const msg = (mobile || email) + String(torusProofNonce)
            const proof = goodWallet?.wallet?.eth?.accounts?.sign(msg, '0x' + privateKey)

            assign(requestPayload, {
              torusProof: proof.signature,
              torusProofNonce,
            })
          }
        }

        await API.addUser(requestPayload)
          .then(({ data }) => (newUserData = data))
          .catch(apiError => {
            const exception = getException(apiError)
            const { message } = exception

            // if user already exists just log.warn then continue signup
            if ('You cannot create more than 1 account with the same credentials' === message) {
              log.warn('User already exists during addUser() call:', message, exception)
            } else {
              // otherwise:
              // completing exception with response object received from axios
              if (!isError(apiError)) {
                exception.response = apiError
              }

              // re-throwing exception to be caught in the parent try {}
              throw exception
            }
          })

        //refresh JWT for a signed up one, server will sign it with permission to use realmdb
        await loginWithWallet(true)

        await userStorage.initRegistered()

        const [mnemonic] = await Promise.all([
          AsyncStorage.getItem(GD_USER_MNEMONIC).then(_ => _ || ''),
          userStorage.userProperties.updateAll({ regMethod, inviterInviteCode: inviteCode }),
        ])

        // trying to update profile 2 times, if failed anyway - re-throwing exception
        await defer(() =>
          fromPromise(
            userStorage.setProfile({
              ...requestPayload,
              walletAddress: goodWallet.account,
              mnemonic,
            }),
          ),
        )
          .pipe(retry(1))
          .toPromise()

        //set tokens for other services returned from backend
        await Promise.all(
          toPairs(pickBy(newUserData, (_, field) => field.endsWith('Token'))).map(([fieldName, fieldValue]) =>
            userStorage.setProfileField(fieldName, fieldValue, 'private'),
          ),
        )

        await Promise.all([
          userStorage.userProperties.set('registered', true),
          AsyncStorage.removeItem(GD_INITIAL_REG_METHOD),
        ])

        fireSignupEvent('SUCCESS', { torusProvider, inviteCode })

        log.debug('New user created')
        setWalletPreparing(false)

        return true
      } catch (exception) {
        const { message } = exception
        const uiMessage = decorate(exception, ExceptionCode.E8)

        log.error('New user failure', message, exception, {
          dialogShown: true,
          requestPayload,
        })

        showSupportDialog(showErrorDialog, hideDialog, navigation.navigate, uiMessage)
        setCreateError(true)
        return false
      } finally {
        setWalletPreparing(false)
      }
    },
    [
      setCreateError,
      setWalletPreparing,
      showErrorDialog,
      fireSignupEvent,
      hideDialog,
      ready,
      regMethod,
      torusUser,
      torusProvider,
      navigation.navigate,
      setActiveStep,
    ],
  )

  const done = useCallback(
    async (data: { [string]: string }) => {
      log.info('signup data:', { data })

      setLoading(true)
      fireSignupEvent()

      let nextRoute = getNextRoute(navigation.state.routes, navigation.state.index, signupData)

      //setting finished to true will trigger finishRegistration effect
      const _signupData = { ...signupData, ...data, lastStep: navigation.state.index, finished: !nextRoute }

      setSignupData(_signupData)
      log.info('signup data:', { data, nextRoute, mergedData: _signupData })

      if (!nextRoute) {
        setLoading(false)

        //do nothing here
        //because setting finished to true (!nextRoute) will trigger finishRegistration effect
      } else if (nextRoute && nextRoute.key === 'SMS') {
        try {
          const result = await checkExisting(torusProvider, pick(_signupData, 'mobile'), {
            withWallet: false,
            eventVars: { fromSignupFlow: true },
          })

          if (result !== 'signup') {
            return
          }

          let {
            data: { ok, error },
          } = await API.sendOTP(_signupData)

          if (!ok) {
            let errorMessage = error

            if (error === 'mobile_already_exists') {
              errorMessage = 'Mobile already exists, please use a different one'
            }

            log.error('Send mobile code failed', errorMessage, new Error(errorMessage), {
              data,
              dialogShown: true,
            })

            return showSupportDialog(showErrorDialog, hideDialog, navigation.navigate, errorMessage)
          }

          return navigateWithFocus(nextRoute.key)
        } catch (e) {
          log.error('Send mobile code failed', e.message, e, { dialogShown: true })
          return showErrorDialog(t`Could not send verification code. Please try again`)
        } finally {
          setLoading(false)
        }
      } else if (nextRoute && nextRoute.key === 'EmailConfirmation') {
        try {
          setLoading(true)

          const result = await checkExisting(torusProvider, pick(_signupData, 'email'), {
            withWallet: false,
            eventVars: { fromSignupFlow: true },
          })

          if (result !== 'signup') {
            return
          }

          const { data } = await API.sendVerificationEmail(_signupData)

          if (data.ok === 0) {
            const error = new Error('Some error occurred on server')

            log.error('Send verification code failed', error.message, error, {
              data,
              dialogShown: true,
            })

            return showErrorDialog(t`Could not send verification email. Please try again`)
          }

          log.debug('skipping email verification?', { ...data, skip: Config.skipEmailVerification })

          if (Config.skipEmailVerification || data.onlyInEnv) {
            // Server is using onlyInEnv middleware (probably dev mode), email verification is not sent.

            // Skip EmailConfirmation screen
            nextRoute = navigation.state.routes[navigation.state.index + 2]

            // Set email as confirmed
            setSignupData({ ..._signupData, isEmailConfirmed: true })
          }

          return navigateWithFocus(nextRoute.key)
        } catch (e) {
          // we need to assign our custom error code for the received error object which will be sent to the sentry
          // the general error message not required
          decorate(e, ExceptionCode.E9)

          log.error('email verification failed unexpected:', e.message, e, { dialogShown: true })
          return showErrorDialog(t`Could not send verification email. Please try again`, ExceptionCode.E9)
        } finally {
          setLoading(false)
        }
      } else if (nextRoute) {
        return navigateWithFocus(nextRoute.key)
      }
    },
    [
      setLoading,
      fireSignupEvent,
      navigateWithFocus,
      finishRegistration,
      showErrorDialog,
      hideDialog,
      setSignupData,
      checkExisting,
      setSuccessfull,
      navigation.navigate,
      signupData,
      isRegMethodSelfCustody,
      ready,
      torusProvider,
      navigation.state.index,
      navigation.state.routes,
      userStorage,
    ],
  )

  const verifyStartRoute = useCallback(() => {
    // we don't support refresh if regMethod param is missing then go back to Auth
    // if regMethod is missing it means user did refresh on later steps then first 1
    if (!regMethod || (navigation.state.index > 0 && signupData.lastStep !== navigation.state.index)) {
      log.debug('redirecting to start, got index:', navigation.state.index, { regMethod, torusUserFromProps })
      return navigation.navigate('Auth')
    }

    setActiveStep(2)

    // if we have name from torus we skip to phone
    if (signupData.fullName) {
      // if skipping phone is disabled
      if (!skipMobile) {
        return navigation.navigate('Phone')
      }

      // if no email address and skipEmail is false (for example: when signup with facebook account that has no verified email)
      if (!skipEmail) {
        return navigateWithFocus('Email')
      }
    }
  }, [
    regMethod,
    navigation,
    signupData,
    navigateWithFocus,
    skipEmail,
    skipMobile,
    torusUserFromProps,
    setActiveStep,
    done,
  ])

  const back = useCallback(() => {
    const prevRoute = getPrevRoute(navigation.state.routes, navigation.state.index, signupData)

    if (prevRoute) {
      navigateWithFocus(prevRoute.key)
    } else {
      navigation.navigate('Auth')
    }
  }, [navigateWithFocus, navigation, signupData])

  //this effect will finish initializing when login, wallet and userstorage are available
  useEffect(() => {
    const source = '' //TODO: get this from somewhere
    if (!ready && goodWallet && userStorage) {
      //lazy login in background while user starts registration
      ;(async () => {
        log.debug('ready: Starting initialization', { isRegMethodSelfCustody, torusUserFromProps })

        identifyWith(signupData.email, goodWallet.getAccountForType('login'))
        fireSignupEvent('STARTED', { source })

        await API.ready
        log.debug('ready: signupstate ready')
        setReady(true)
      })()
    }
  }, [goodWallet, userStorage, signupData.email, ready])

  //on mount effect to do some basi checks and init
  useEffect(() => {
    const onMount = async () => {
      //if email from torus then identify user
      signupData.email && identifyOnUserSignup(signupData.email)

      //get user country code for phone
      //read torus seed
      if (signupData.skipPhone === false) {
        await getCountryCode()
      }

      checkTorusLogin()
      verifyStartRoute()
    }

    onMount()
  }, [])

  // listening to the email changes in the state
  useEffect(() => {
    const { email } = signupData

    // perform this again for torus and on email change. torus has also mobile verification that doesn't set email
    if (!email || !isLoggedInJWT) {
      return
    }

    // once email appears in the state - identifying and setting 'identified' flag
    identifyOnUserSignup(email)

    //add user to crm once we have his email
    API.addSignupContact(signupData)
      .then(() => log.info('addSignupContact success', { state: signupData }))
      .catch(e => log.error('addSignupContact failed', e.message, e))
  }, [signupData.email, isLoggedInJWT])

  useEffect(() => {
    const backButtonHandler = new BackButtonHandler({ defaultAction: back })

    return () => {
      backButtonHandler.unregister()
    }
  }, [back])

  const { scrollableContainer, contentContainer } = styles

  return (
    <View style={{ flexGrow: isMobileSafariKeyboardShown ? 0 : 1 }}>
      <NavBar logo />
      <AuthStateWrapper>
        <AuthProgressBar step={activeStep} done={signupSuccess} />
        <ScrollView contentContainerStyle={scrollableContainer}>
          <View style={contentContainer}>
            {
              <SignupWizardNavigator
                navigation={navigation}
                screenProps={{
                  data: { ...signupData, loading, createError, countryCode },
                  doneCallback: done,
                  back,
                }}
              />
            }
          </View>
        </ScrollView>
      </AuthStateWrapper>
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
