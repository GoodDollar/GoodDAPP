// @flow
import React, { useCallback, useContext, useEffect } from 'react'
import { Platform } from 'react-native'
import { get } from 'lodash'

import { t } from '@lingui/macro'
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
import { GD_PROVIDER, GD_USER_MASTERSEED, GD_USER_MNEMONIC } from '../../../lib/constants/localStorage'
import {
  REGISTRATION_METHOD_SELF_CUSTODY,
  REGISTRATION_METHOD_TORUS,
  REGISTRATION_METHOD_WEB3WALLET,
} from '../../../lib/constants/login'
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

import DeepLinking from '../../../lib/utils/deepLinking'
import { GoodWalletContext } from '../../../lib/wallet/GoodWalletProvider'

import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'
import AuthContext from '../context/AuthContext'
import mustache from '../../../lib/utils/mustache'
import { useWalletConnector } from '../../../lib/wallet/thirdparty/useWalletConnector'
import useTorus from './hooks/useTorus'
import { TorusStatusCode } from './sdk/TorusSDK'
const log = logger.child({ from: 'AuthTorus' })

const AuthTorus = ({ screenProps, navigation, styles }) => {
  const { initWalletAndStorage } = useContext(GoodWalletContext)
  const { setLoggedInRouter } = useContext(GlobalTogglesContext)
  const { hideDialog, showErrorDialog } = useDialog()
  const { setWalletPreparing, setTorusInitialized, setSuccessfull, setActiveStep } = useContext(AuthContext)
  const checkExisting = useCheckExisting()
  const [torusSDK, sdkInitialized] = useTorus()
  const { walletConnect } = useWalletConnector()
  const { navigate } = navigation

  const getTorusUserRedirect = async () => {
    if (!sdkInitialized || torusSDK.popupMode) {
      return
    }

    // in case of redirect flow we need to recover the provider/login type
    const provider = await AsyncStorage.getItem('recallTorusRedirectProvider')
    const { hash } = DeepLinking

    if (provider && hash) {
      log.debug('triggering torus redirect callback flow', { hash })
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
      const cancelled = e.message.toLowerCase().includes('user closed')

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

  const handleTorusError = (exception, options) => {
    const { provider, fromRedirect = false } = options || {}
    const { message = '', name } = exception || {}
    const { UserCancel, BrowserNotAllowed } = TorusStatusCode
    let suggestion

    log.error('torus signin failed:', message, exception, {
      provider,
      fromRedirect,
      dialogShown: true,
    })

    switch (name) {
      case BrowserNotAllowed: {
        const suggestedBrowser = Platform.select({
          ios: 'Safari',
          android: 'Chrome',
        })

        suggestion = mustache(
          t`Your default browser isn't supported. Please, set {suggestedBrowser} as default and try again.`,
          { suggestedBrowser },
        )
        break
      }
      case UserCancel:
        return
      default:
        suggestion = 'Please try again.'
        break
    }

    showErrorDialog(t`We were unable to load the wallet.` + ` ${suggestion}`)
  }

  const selfCustodyLogin = useCallback(() => {
    fireEvent(SIGNIN_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })
    return navigate('SigninInfo')
  })

  const selfCustody = useCallback(async () => {
    const curSeed = (await AsyncStorage.getItem(GD_USER_MASTERSEED)) || (await AsyncStorage.getItem(GD_USER_MNEMONIC))

    //in case user started torus signup but came back here we need to re-initialize wallet/storage with
    //new credentials
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
      | 'web3wallet'
      | 'selfCustody',
    torusUserRedirectPromise,
  ) => {
    const fromRedirect = !!torusUserRedirectPromise
    const torusPopupMode = config.env === 'test' || torusSDK.popupMode
    const onTorusError = e => handleTorusError(e, { fromRedirect, provider })

    // calling with redirect promise in popup mode is a nonsense
    if (torusSDK.popupMode && torusUserRedirectPromise) {
      return
    }

    AsyncStorage.setItem(GD_PROVIDER, provider === 'web3wallet' ? 'WEB3WALLET' : 'SEED')
    if (provider === 'selfCustody') {
      initWalletAndStorage(undefined, 'SEED') //initialize the wallet (it will generate a mnemonic)
      return selfCustody()
    }

    if (provider === 'selfCustodyLogin') {
      return selfCustodyLogin()
    }

    let web3Provider, torusUser
    setWalletPreparing(true)

    // in case this is triggered as a callback after redirect we fire a different vent
    fireEvent(fromRedirect ? TORUS_REDIRECT_SUCCESS : SIGNIN_METHOD_SELECTED, {
      method: provider,
      torusPopupMode, // for a/b testing, it always be false in case of redirect
    })

    let regMethod

    if (provider === 'web3wallet') {
      regMethod = REGISTRATION_METHOD_WEB3WALLET
      try {
        web3Provider = await walletConnect()
      } catch (e) {
        return setWalletPreparing(false)
      }
      log.debug('walletConnect result:', { web3Provider })
      torusUser = {
        publicAddress: web3Provider.address,
      }
    } else {
      regMethod = REGISTRATION_METHOD_TORUS
      let torusResponse

      try {
        // don't expect response if in redirect mode, this method will be called again with response from effect
        if (!torusPopupMode && !torusUserRedirectPromise) {
          // just trigger the oauth and return
          log.debug('trigger redirect flow')

          // keep the provider and if user is signin/signup for recall
          AsyncStorage.safeSet('recallTorusRedirectProvider', provider)

          // here in redirect mode we are not waiting for response from torus
          getTorusUser(provider)
            .catch(onTorusError)
            .finally(() => setWalletPreparing(false))

          return
        }

        // torusUserRedirectPromise - redirect mode
        // getTorusUser(provider) - popup mode
        const torusUserPromise = torusPopupMode ? getTorusUser(provider) : torusUserRedirectPromise

        torusResponse = await handleTorusResponse(torusUserPromise, provider)

        if (!get(torusResponse, 'torusUser')) {
          throw new Error('Invalid Torus response.')
        }

        torusUser = torusResponse.torusUser
      } catch (e) {
        onTorusError(e)
        setWalletPreparing(false)
        return
      }
    }
    try {
      setActiveStep(2)

      // get full name, email, number, userId
      const [goodWallet] = await initWalletAndStorage(
        web3Provider ? web3Provider : torusUser.privateKey,
        web3Provider ? provider.toUpperCase() : 'SEED',
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
            regMethod,
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
      getTorusUserRedirect()
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
