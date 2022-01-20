// @flow
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { get } from 'lodash'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import logger from '../../../lib/logger/js-logger'
import {
  fireEvent,
  SIGNIN_METHOD_SELECTED,
  SIGNIN_TORUS_SUCCESS,
  SIGNUP_METHOD_SELECTED,
  TORUS_FAILED,
  TORUS_POPUP_CLOSED,
  TORUS_REDIRECT_SUCCESS,
  TORUS_SUCCESS,
} from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC, IS_LOGGED_IN } from '../../../lib/constants/localStorage'
import { REGISTRATION_METHOD_SELF_CUSTODY, REGISTRATION_METHOD_TORUS } from '../../../lib/constants/login'
import { withStyles } from '../../../lib/styles'
import config from '../../../config/config'
import { theme as mainTheme } from '../../theme/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { useDialog } from '../../../lib/undux/utils/dialog'
import { showSupportDialog } from '../../common/dialogs/showSupportDialog'
import { decorate, ExceptionCode } from '../../../lib/exceptions/utils'

import { isWeb } from '../../../lib/utils/platform'
import { getDesignRelativeHeight, isSmallDevice } from '../../../lib/utils/sizes'
import { getShadowStyles } from '../../../lib/utils/getStyles'
import normalizeText from '../../../lib/utils/normalizeText'
import useCheckExisting from '../hooks/useCheckExisting'

import ready from '../ready'
import SignUpIn from '../login/SignUpScreen'

import DeepLinking from '../../../lib/utils/deepLinking'

import AuthContext from '../context/AuthContext'
import useTorus from './hooks/useTorus'

const log = logger.child({ from: 'AuthTorus' })

const AuthTorus = ({ screenProps, navigation, styles, store }) => {
  const [, hideDialog, showErrorDialog] = useDialog()
  const { setWalletPreparing, setHandleLoginMethod, setAuthNavigator, setSuccessfull } = useContext(AuthContext)
  const checkExisting = useCheckExisting()
  const [torusSDK, sdkInitialized] = useTorus()
  const [authScreen, setAuthScreen] = useState(get(navigation, 'state.params.screen'))
  const { navigate } = navigation

  const getTorusUserRedirect = async () => {
    //in case of redirect flow we need to recover the provider/login type
    const provider = await AsyncStorage.getItem('recallTorusRedirectProvider')

    if (sdkInitialized && provider && torusSDK.popupMode === false && (DeepLinking.hash || DeepLinking.query)) {
      log.debug('triggering torus redirect callback flow')
      AsyncStorage.removeItem('recallTorusRedirectProvider')
      handleLoginMethod(provider, torusSDK.getRedirectResult())
    }
  }

  const getTorusUser = useCallback(
    // eslint-disable-next-line require-await
    async provider => {
      if (['development', 'test'].includes(config.env)) {
        const torusUser = await AsyncStorage.getItem('TorusTestUser')

        if (torusUser != null) {
          return torusUser
        }
      }

      return torusSDK.triggerLogin(provider)
    },
    [torusSDK],
  )

  const handleTorusResponse = async (torusUserPromise, provider) => {
    let torusUser, replacing

    try {
      torusUser = await torusUserPromise

      const curSeed = await AsyncStorage.getItem(GD_USER_MASTERSEED)
      const curMnemonic = await AsyncStorage.getItem(GD_USER_MNEMONIC)

      if (curMnemonic || (curSeed && curSeed !== torusUser.privateKey)) {
        await AsyncStorage.clear()
        replacing = true
      }

      if (!torusUser.privateKey) {
        log.warn('Missing private key from torus response', { torusUser })
        throw new Error('Missing privateKey from torus response')
      }

      //set masterseed so wallet can use it in 'ready' where we check if user exists
      await AsyncStorage.setItem(GD_USER_MASTERSEED, torusUser.privateKey)
      fireEvent(TORUS_SUCCESS, { provider })
      log.debug('torus login success', { torusUser, provider })
    } catch (e) {
      // store.set('loadingIndicator')({ loading: false })
      fireEvent(TORUS_FAILED, { provider, error: e.message })
      const cancelled = e.message.toLowerCase().includes('user closed')
      if (cancelled) {
        log.warn('torus popup closed', e.message, e)
        fireEvent(TORUS_POPUP_CLOSED, { provider, reason: e.message })
        throw e
      } else {
        log.error('torus login failed', e.message, e, { dialogShown: true })
        throw e
      }
    }
    return { torusUser, replacing }
  }

  const selfCustodyLogin = useCallback(() => {
    fireEvent(SIGNIN_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })
    return navigate('SigninInfo')
  })

  const selfCustody = useCallback(async () => {
    const curSeed = await AsyncStorage.getItem(GD_USER_MASTERSEED)

    //in case user started torus signup but came back here we need to re-initialize wallet/storage with
    //new credentials
    if (curSeed) {
      await AsyncStorage.clear()
      await ready(true)
    }

    fireEvent(SIGNUP_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })
    navigate('Signup', { regMethod: REGISTRATION_METHOD_SELF_CUSTODY })
  }, [navigate])

  const handleLoginMethod = async (
    provider: 'facebook' | 'google' | 'auth0' | 'auth0-pwdless-email' | 'auth0-pwdless-sms',
    torusUserRedirectPromise,
  ) => {
    let torusResponse

    setWalletPreparing(true)

    try {
      // in case this is triggered as a callback after redirect we fire a different vent
      if (torusUserRedirectPromise) {
        fireEvent(TORUS_REDIRECT_SUCCESS, {
          method: provider,
          torusPopupMode: torusSDK.popupMode, // this should always be false in case of redirect
        })
      } else {
        fireEvent(SIGNIN_METHOD_SELECTED, {
          method: provider,
          torusPopupMode: torusSDK.popupMode, // for a/b testing
        })
      }

      if (provider === 'selfCustody') {
        return selfCustody()
      }

      if (provider === 'selfCustodyLogin') {
        return selfCustodyLogin()
      }

      try {
        //don't expect response if in redirect mode, this method will be called again with response from effect
        if (config.env !== 'test' && !torusSDK.popupMode && torusUserRedirectPromise == null) {
          //just trigger the oauth and return
          log.debug('trigger redirect flow')

          //keep the provider and if user is signin/signup for recall
          AsyncStorage.setItem('recallTorusRedirectProvider', provider)

          //here in redirect mode we are not waiting for response from torus
          await getTorusUser(provider)
          setWalletPreparing(false)
          return
        }

        //torusUserRedirectPromise - redirect mode
        //getTorusUser(provider) - popup mode
        torusResponse = await handleTorusResponse(torusUserRedirectPromise || getTorusUser(provider), provider)

        if (get(torusResponse, 'torusUser') == null) {
          throw new Error('Invalid Torus response.')
        }
      } catch (e) {
        log.error('torus signin failed:', e.message, e, {
          provider,
          fromRedirect: !!torusUserRedirectPromise,
          dialogShown: true,
        })
        let suggestion = 'Please try again.'
        const { message = '' } = e || {}

        if (message.includes('NoAllowedBrowserFoundException')) {
          const suggestedBrowser = Platform.select({
            ios: 'Safari',
            android: 'Chrome',
          })

          suggestion = `Your default browser isn't supported. Please, set ${suggestedBrowser} as default and try again.`
        }

        setWalletPreparing(false)
        showErrorDialog(`We were unable to load the wallet. ${suggestion}`)
        return
      }

      // get full name, email, number, userId
      const { torusUser } = torusResponse
      const existsResult = await checkExisting(provider, torusUser)

      switch (existsResult) {
        case 'login': {
          // case of sign-in
          fireEvent(SIGNIN_TORUS_SUCCESS, { provider })
          await AsyncStorage.setItem(IS_LOGGED_IN, true)

          setWalletPreparing(false)
          setSuccessfull(() => store.set('isLoggedIn')(true))
          return
        }
        case 'signup': {
          log.debug('user does not exists')

          if (isWeb) {
            //Hack to get keyboard up on mobile need focus from user event such as click
            setTimeout(() => {
              const el = document.getElementById('Name_input')
              if (el) {
                el.focus()
              }
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
      log.error('Failed to initialize wallet and storage', message, exception)
    } finally {
      setWalletPreparing(false)
    }
  }

  useEffect(() => {
    //helper to show user login/signup when he presses back or cancels login flow
    setAuthNavigator(navigation)
    if (authScreen == null) {
      AsyncStorage.getItem('recallTorusRedirectScreen').then(screen => {
        log.debug('recall authscreen for torus redirect flow', screen)
        screen && setAuthScreen(screen)
      })
    }
  }, [])

  useEffect(() => {
    if (authScreen) {
      //when user switches between login/signup we clear the recall
      AsyncStorage.setItem('recallTorusRedirectScreen', authScreen)
    }
  }, [authScreen])

  useEffect(() => {
    if (sdkInitialized) {
      getTorusUserRedirect()
      setHandleLoginMethod(() => handleLoginMethod)
    }
  }, [sdkInitialized])

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

const Auth = withStyles(getStylesFromProps)(SimpleStore.withStore(AuthTorus))
Auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true,
}

export default Auth
