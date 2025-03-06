// @flow
import React, { useCallback, useContext, useEffect } from 'react'
import { t } from '@lingui/macro'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { AccessToken, LoginManager, Profile, Settings } from 'react-native-fbsdk-next'
import Auth0 from 'react-native-auth0'

import AsyncStorage from '../../../lib/utils/asyncStorage'
import logger from '../../../lib/logger/js-logger'
import {
  fireEvent,
  SIGNIN_METHOD_SELECTED,
  SIGNIN_TORUS_SUCCESS,
  SIGNUP_METHOD_SELECTED,
  TORUS_FAILED,
  TORUS_POPUP_CLOSED,
  TORUS_SUCCESS,
} from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC } from '../../../lib/constants/localStorage'
import { REGISTRATION_METHOD_SELF_CUSTODY, REGISTRATION_METHOD_TORUS } from '../../../lib/constants/login'
import { withStyles } from '../../../lib/styles'
import config from '../../../config/config'
import { theme as mainTheme } from '../../theme/styles'
import { useDialog } from '../../../lib/dialog/useDialog'
import { showSupportDialog } from '../../common/dialogs/showSupportDialog'
import { decorate, ExceptionCode } from '../../../lib/exceptions/utils'

import { isWeb } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, isSmallDevice } from '../../../lib/utils/sizes'
import { getShadowStyles } from '../../../lib/utils/getStyles'
import normalizeText from '../../../lib/utils/normalizeText'
import useCheckExisting from '../hooks/useCheckExisting'

import SignUpIn from '../login/SignUpScreen'

import { GoodWalletContext } from '../../../lib/wallet/GoodWalletProvider'
import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'
import AuthContext from '../context/AuthContext'
import useTorus from './hooks/useTorus'

const log = logger.child({ from: 'AuthTorusNative' })

const AuthTorus = ({ screenProps, navigation, styles }) => {
  const { initWalletAndStorage } = useContext(GoodWalletContext)
  const { setLoggedInRouter } = useContext(GlobalTogglesContext)
  const { hideDialog, showErrorDialog } = useDialog()
  const { setWalletPreparing, setTorusInitialized, setSuccessfull, setActiveStep } = useContext(AuthContext)
  const checkExisting = useCheckExisting()
  const [torusSDK, sdkInitialized] = useTorus()
  const { navigate } = navigation

  const handleTorusResponse = async (provider, userInfo) => {
    let replacing
    let torusUser
    try {
      log.info('triggering torus login:', { provider, userInfo })
      const web3AuthConnect = await torusSDK.triggerLogin(provider)
      const finalKeyData = await web3AuthConnect(userInfo.idToken, userInfo.userIdentifier)
      torusUser = torusSDK.fetchTorusUser({ userInfo, finalKeyData })
      log.info('torus login result:', { torusUser })

      const curSeed = await AsyncStorage.getItem(GD_USER_MASTERSEED)
      const curMnemonic = await AsyncStorage.getItem(GD_USER_MNEMONIC)

      if (curMnemonic || (curSeed && curSeed !== torusUser.privateKey)) {
        await AsyncStorage.clear()
        replacing = true
      }

      if (!torusUser.privateKey) {
        const exception = new Error('Missing privateKey from torus response')

        exception.payload = { torusUser, provider, curSeed, curMnemonic }
        throw exception
      }

      // set masterseed so wallet can use it in 'ready' where we check if user exists
      await AsyncStorage.setItem(GD_USER_MASTERSEED, torusUser.privateKey)
      fireEvent(TORUS_SUCCESS, { provider })
      log.debug('torus login success', { torusUser, provider })
    } catch (e) {
      const cancelled = e.message.toLowerCase().search('closed|cancel') >= 0

      fireEvent(TORUS_FAILED, { provider, error: e.message })

      if (cancelled) {
        log.warn('torus popup closed', e.message, e)
        fireEvent(TORUS_POPUP_CLOSED, { provider, reason: e.message })

        throw e
      }

      log.error('torus login failed', e.message, e, { dialogShown: true })
      throw e
    }

    return { torusUser, replacing }
  }

  const selfCustodyLogin = useCallback(() => {
    fireEvent(SIGNIN_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })
    return navigate('SigninInfo')
  })

  const selfCustody = useCallback(async () => {
    const curSeed = (await AsyncStorage.getItem(GD_USER_MASTERSEED)) || (await AsyncStorage.getItem(GD_USER_MNEMONIC))

    // in case user started torus signup but came back here we need to re-initialize wallet/storage with
    // new credentials
    if (curSeed) {
      log.debug('selfcustody clear storage')
      await AsyncStorage.clear()
    }

    fireEvent(SIGNUP_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })
    navigate('Signup', { regMethod: REGISTRATION_METHOD_SELF_CUSTODY })
  }, [navigate])

  const handleLoginMethod = async (
    provider:
      | 'facebook'
      | 'google'
      | 'auth0'
      | 'auth0-pwdless-email'
      | 'auth0-pwdless-sms'
      | 'wallet-connect'
      | 'metamask',
    torusUserRedirectPromise,
  ) => {
    if (provider === 'selfCustody') {
      initWalletAndStorage(undefined, 'SEED') //initialize the wallet (it will generate a mnemonic)
      return selfCustody()
    }

    if (provider === 'selfCustodyLogin') {
      return selfCustodyLogin()
    }

    setWalletPreparing(true)

    // in case this is triggered as a callback after redirect we fire a different vent
    fireEvent(SIGNIN_METHOD_SELECTED, {
      method: provider,
    })

    let torusUser = {}
    try {
      switch (provider) {
        case 'google':
          {
            GoogleSignin.configure({
              webClientId: config.googleClientId,
              forceCodeForRefreshToken: true,
              offlineAccess: true,
            })
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

            // Get the users ID token
            const user = await GoogleSignin.getCurrentUser()
            if (user?.idToken) {
              await GoogleSignin.clearCachedAccessToken(user.idToken)
            }
            await GoogleSignin.signOut().catch()
            const signInResult = await GoogleSignin.signIn()

            torusUser.idToken = signInResult.data.idToken
            torusUser.userIdentifier = signInResult.data?.user.email
            torusUser.email = torusUser.userIdentifier
            torusUser.name = signInResult.data?.user.name
            log.info('GoogleSignin', { torusUser, signInResult })
            if (!torusUser.idToken) {
              throw new Error('No ID token found')
            }
          }
          break
        case 'facebook':
          {
            await LoginManager.logOut()
            const signInResult = await LoginManager.logInWithPermissions(['public_profile', 'email'])

            torusUser.idToken = (await AccessToken.getCurrentAccessToken())?.accessToken
            const profile = await Profile.getCurrentProfile()
            torusUser.userIdentifier = profile?.userID
            torusUser.name = profile?.name
            log.info('Facebook Login', { torusUser, signInResult, profile })
            if (!torusUser.idToken) {
              throw new Error('No ID token found')
            }
            const response = await fetch(`https://graph.facebook.com/me?fields=email&access_token=${torusUser.idToken}`)
            const { email } = await response.json()
            torusUser.email = email
          }
          break
        case 'auth0-pwdless-sms':
          {
            const auth0 = new Auth0({
              domain: config.auth0Domain,
              clientId: config.auth0SMSClientId,
            })
            log.info('Auth0 settings:', {
              domain: config.auth0Domain,
              clientId: config.auth0SMSClientId,
            })
            const auth = await auth0.webAuth.authorize()
            torusUser.idToken = auth.idToken
            const userInfo = await auth0.auth.userInfo({ token: auth.accessToken })
            torusUser.userIdentifier = userInfo.name //remove + for torus unique id
            torusUser.mobile = userInfo.name
            log.info('Auth0 Login', { auth, userInfo, torusUser })
            if (!torusUser.idToken) {
              throw new Error('No ID token found')
            }
          }
          break
        default:
          break
      }
      const result = await handleTorusResponse(provider, torusUser)
      torusUser = result.torusUser
      log.info('torus succes:', { torusUser })
    } catch (e) {
      log.error('login failed', e.message, e, { provider })
      showErrorDialog(t`We were unable to load the wallet. Please try again`)
      setWalletPreparing(false)
      return
    }

    try {
      setActiveStep(2)

      // get full name, email, number, userId
      const [goodWallet] = await initWalletAndStorage(
        torusUser.privateKey,
        'SEED',
        provider?.charAt(0).toUpperCase() + provider.slice(1),
      )

      const existsResult = await checkExisting(provider, torusUser, {
        withWallet: goodWallet,
      })

      log.info('checkExisting result:', { existsResult })

      switch (existsResult) {
        case 'login': {
          // case of sign-in
          fireEvent(SIGNIN_TORUS_SUCCESS, { provider })

          setWalletPreparing(false)
          setSuccessfull(() => setLoggedInRouter(true))
          return
        }
        case 'signup': {
          if (isWeb) {
            // Hack to get keyboard up on mobile need focus from user event such as click
            setTimeout(() => {
              const el = document.getElementById('Name_input')

              el && el.focus()
            }, 500)
          }

          // create account
          return navigate('Signup', {
            regMethod: REGISTRATION_METHOD_TORUS,
            torusUser,
            torusProvider: provider,
          })
        }
        default:
          // login with other method has been selected, app will redirect
          break
      }
    } catch (exception) {
      const { message } = exception
      const uiMessage = decorate(exception, ExceptionCode.E14)

      showSupportDialog(showErrorDialog, hideDialog, navigation.navigate, uiMessage)
      log.error('Failed to initialize wallet and storage', message, exception, { provider })
    } finally {
      setWalletPreparing(false)
    }
  }

  useEffect(() => {
    if (sdkInitialized) {
      Settings.setAppID(config.facebookAppId)
      Settings.setClientToken(config.facebookClientToken)
      Settings.initializeSDK()

      GoogleSignin.configure({
        webClientId: config.googleClientId,
      })
      setTorusInitialized(handleLoginMethod)
    }
  }, [sdkInitialized])

  useEffect(() => {
    setActiveStep(1)
  }, [setActiveStep])

  return (
    <SignUpIn
      screenProps={screenProps}
      navigation={navigation}
      handleLoginMethod={handleLoginMethod}
      sdkInitialized={sdkInitialized}
      goBack={'signup'}
    />
  )
}

const getStylesFromProps = ({ theme }) => {
  const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)

  return {
    textBlack: {
      color: theme.fontStyle.color,
    },
    buttonLayout: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      flex: 1,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 50,
      padding: 3,
      ...getShadowStyles('none'),
    },
    buttonText: {
      fontSize: buttonFontSize,
      flex: 1,
    },
    paragraph: {
      fontSize: normalizeText(24),
      textAlign: 'center',
      color: theme.colors.red,
      lineHeight: 32,
      fontFamily: theme.fonts.slab,
    },
    marginBottom: {
      marginBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    },
    paragraphContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    modalButtonsContainerStyle: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
    modalButtonsContainerRow: {
      flex: 1,
      flexDirection: 'row',
      maxHeight: getDesignRelativeHeight(30),
      marginBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    },
    whiteButton: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      ...getShadowStyles('none'),
    },
    primaryText: {
      color: mainTheme.colors.primary,
    },
    paragraphContent: {
      fontSize: normalizeText(16),
      lineHeight: 22,
      color: theme.colors.darkGray,
      fontFamily: theme.fonts.default,
    },
    paragraphBold: {
      textAlign: 'center',
      fontWeight: 'bold',
    },
    fixMargin: {
      marginVertical: -6,
      marginHorizontal: -13,
    },
    iconBorder: {
      backgroundColor: theme.colors.white,
      borderRadius: 50,
      zIndex: -1,
      alignItems: 'center',
      paddingVertical: getDesignRelativeHeight(9),
      paddingHorizontal: getDesignRelativeHeight(15),
    },
    iconsStyle: {
      width: getDesignRelativeHeight(14),
      height: getDesignRelativeHeight(26),
    },
  }
}

const Auth = withStyles(getStylesFromProps)(AuthTorus)
Auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true,
}

export default Auth
