// @flow
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { get } from 'lodash'
import Web3 from 'web3'

import WalletConnectProvider from '@walletconnect/web3-provider'
import QRCodeModal from '@walletconnect/qrcode-modal'

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
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC } from '../../../lib/constants/localStorage'
import {
  REGISTRATION_METHOD_METAMASK,
  REGISTRATION_METHOD_SELF_CUSTODY,
  REGISTRATION_METHOD_TORUS,
  REGISTRATION_METHOD_WALLETCONNECT,
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

import * as metamask from '../../../lib/connectors/metamask'

import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'
import AuthContext from '../context/AuthContext'
import mustache from '../../../lib/utils/mustache'
import useTorus from './hooks/useTorus'

const log = logger.child({ from: 'AuthTorus' })

async function metamaskLogin() {
  await metamask.metaMask.activate()
  const web3 = new Web3(Web3.givenProvider)
  if (!web3.eth.defaultAccount) {
    web3.eth.defaultAccount = metamask.metaMask.provider.selectedAddress
  }

  return web3
}

async function walletconnectLogin() {
  const rpc = Object.keys(config.ethereum).reduce((acc, key) => {
    acc[key] = config.ethereum[key].httpWeb3provider
    return acc
  }, {})

  const provider = new WalletConnectProvider({
    bridge: 'https://bridge.walletconnect.org',
    clientMeta: {
      name: 'GoodDollar Wallet',
      url: 'https://wallet.gooddollar.org/',
      icons: ['https://wallet.gooddollar.org/apple-icon.png'],
      description:
        'GoodDollar is a non-profit protocol and G$ digital coin to deliver universal basic income on a global scale.',
    },
    infuraId: config.infuraKey,
    qrcodeModal: QRCodeModal,
    rpc,
  })

  const connector = provider.connector

  // force reconnect to trigger qr code modal
  if (connector.connected) {
    await connector.killSession()
  }
  await connector.connect()
  await provider.enable()
  const web3 = new Web3(provider)

  if (!web3.eth.defaultAccount) {
    web3.eth.defaultAccount = connector.accounts?.[0]
  }

  return web3
}

const AuthTorus = ({ screenProps, navigation, styles }) => {
  const { initWalletAndStorage } = useContext(GoodWalletContext)
  const { setLoggedInRouter } = useContext(GlobalTogglesContext)
  const { hideDialog, showErrorDialog } = useDialog()
  const { setWalletPreparing, setTorusInitialized, setSuccessfull, setActiveStep } = useContext(AuthContext)
  const checkExisting = useCheckExisting()
  const [torusSDK, sdkInitialized] = useTorus()
  const [authScreen, setAuthScreen] = useState(get(navigation, 'state.params.screen'))
  const { navigate } = navigation

  const getTorusUserRedirect = async () => {
    if (!sdkInitialized || torusSDK.popupMode) {
      return
    }

    // in case of redirect flow we need to recover the provider/login type
    const provider = await AsyncStorage.getItem('recallTorusRedirectProvider')
    const { hash, query } = DeepLinking

    if (provider && (hash || query)) {
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

  const handleTorusError = (e, options) => {
    const { provider, fromRedirect = false } = options || {}
    const { message = '' } = e || {}
    let suggestion = 'Please try again.'

    log.error('torus signin failed:', message, e, {
      provider,
      fromRedirect,
      dialogShown: true,
    })

    if (message.includes('NoAllowedBrowserFoundException')) {
      const suggestedBrowser = Platform.select({
        ios: 'Safari',
        android: 'Chrome',
      })

      suggestion = mustache(
        t`Your default browser isn't supported. Please, set {suggestedBrowser} as default and try again.`,
        { suggestedBrowser },
      )
    }

    setWalletPreparing(false)

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
      | 'walletconnect'
      | 'metamask',
    torusUserRedirectPromise,
  ) => {
    const fromRedirect = !!torusUserRedirectPromise
    const torusPopupMode = config.env === 'test' || torusSDK.popupMode
    const onTorusError = e => handleTorusError(e, { fromRedirect, provider })

    // calling with redirect promise in popup mode is a nonsense
    if (torusSDK.popupMode && torusUserRedirectPromise) {
      return
    }

    if (provider === 'selfCustody') {
      initWalletAndStorage(undefined, 'SEED') //initialize the wallet (it will generate a mnemonic)
      return selfCustody()
    }

    if (provider === 'selfCustodyLogin') {
      return selfCustodyLogin()
    }

    let web3, torusUser
    setWalletPreparing(true)

    // in case this is triggered as a callback after redirect we fire a different vent
    fireEvent(fromRedirect ? TORUS_REDIRECT_SUCCESS : SIGNIN_METHOD_SELECTED, {
      method: provider,
      torusPopupMode, // for a/b testing, it always be false in case of redirect
    })

    let regMethod

    if (provider === 'walletconnect') {
      regMethod = REGISTRATION_METHOD_WALLETCONNECT
      web3 = await walletconnectLogin()
      torusUser = {
        publicAddress: web3.currentProvider.accounts[0],
      }
    } else if (provider === 'metamask') {
      regMethod = REGISTRATION_METHOD_METAMASK
      web3 = await metamaskLogin()
      torusUser = {
        publicAddress: web3.address,
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
          AsyncStorage.setItem('recallTorusRedirectProvider', provider)

          // here in redirect mode we are not waiting for response from torus
          getTorusUser(provider)
            .then(() => setWalletPreparing(false))
            .catch(onTorusError)

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
        return
      }
    }
    try {
      setActiveStep(2)

      // get full name, email, number, userId
      const goodWallet = await initWalletAndStorage(
        web3 ? web3 : torusUser.privateKey,
        web3 ? provider.toUpperCase() : 'SEED',
      )

      const existsResult = await checkExisting(provider, torusUser, goodWallet)
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
    //helper to show user login/signup when he presses back or cancels login flow
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
