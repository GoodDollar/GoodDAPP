// @flow
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Paragraph } from 'react-native-paper'
import { Image, TouchableOpacity, View } from 'react-native'
import { get } from 'lodash'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import logger from '../../../lib/logger/pino-logger'
import {
  CLICK_BTN_GETINVITED,
  fireEvent,
  SIGNIN_METHOD_SELECTED,
  SIGNIN_TORUS_SUCCESS,
  SIGNUP_METHOD_SELECTED,
  SIGNUP_STARTED,
} from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC, IS_LOGGED_IN } from '../../../lib/constants/localStorage'
import { REGISTRATION_METHOD_SELF_CUSTODY, REGISTRATION_METHOD_TORUS } from '../../../lib/constants/login'
import CustomButton from '../../common/buttons/CustomButton'
import Text from '../../common/view/Text'
import { withStyles } from '../../../lib/styles'
import illustration from '../../../assets/Auth/torusIllustration.svg'
import config from '../../../config/config'
import { theme as mainTheme } from '../../theme/styles'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { useDialog } from '../../../lib/undux/utils/dialog'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { isMediumDevice, isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import formatProvider from '../../../lib/utils/formatProvider'
import normalizeText from '../../../lib/utils/normalizeText'
import { userExists } from '../../../lib/login/userExists'
import SignIn from '../login/SignInScreen'
import SignUp from '../login/SignUpScreen'

import { delay } from '../../../lib/utils/async'
import retryImport from '../../../lib/utils/retryImport'
import LoadingIcon from '../../common/modal/LoadingIcon'
import SuccessIcon from '../../common/modal/SuccessIcon'
import mobileBtnIcon from '../../../assets/Auth/btn_mobile.svg'

// import SpinnerCheckMark from '../../common/animations/SpinnerCheckMark'

import useOnPress from '../../../lib/hooks/useOnPress'
import useTorus from './hooks/useTorus'

Image.prefetch(illustration)

const log = logger.child({ from: 'AuthTorus' })

const AuthTorus = ({ screenProps, navigation, styles, store }) => {
  const asGuest = true
  const [isPasswordless, setPasswordless] = useState(false)
  const [screenParams, setScreenParams] = useState(SIGNUP_METHOD_SELECTED)
  const [showDialog, hideDialog, showErrorDialog] = useDialog()
  const [torusSDK, sdkInitialized] = useTorus()
  const { navigate } = navigation
  const navigationParams = get(navigation, 'state.params.screen')
  const isSignUp = screenParams !== SIGNIN_METHOD_SELECTED
  const Screen = useMemo(() => (isSignUp ? SignUp : SignIn), [isSignUp])
  const { push } = screenProps

  useEffect(() => {
    handleNavigation()
  }, [])

  const handleNavigation = async () => {
    const screen = await AsyncStorage.getItem('currentScreen', navigationParams)
    if (navigationParams) {
      await AsyncStorage.setItem('currentScreen', navigationParams)
      return setScreenParams(navigationParams)
    }
    if (screen) {
      await AsyncStorage.setItem('currentScreen', screen)
      return setScreenParams(screen)
    }
  }

  const goToW3Site = () => {
    fireEvent(CLICK_BTN_GETINVITED)
    window.location = config.web3SiteUrl
  }

  const signupGoogle = () => handleLoginMethod(config.isPhaseZero ? 'google-old' : 'google')
  const signupFacebook = () => handleLoginMethod('facebook')
  const signupAuth0 = loginType =>
    handleLoginMethod(loginType === 'email' ? 'auth0-pwdless-email' : 'auth0-pwdless-sms')

  const showLoadingDialog = () => {
    showDialog({
      image: <LoadingIcon />,
      loading: true,
      message: 'Please wait\nThis might take a few seconds...',
      showButtons: false,
      title: `PREPARING\nYOUR WALLET`,
      showCloseButtons: false,
    })
  }

  const showEmailUsedDialog = (provider, source) => {
    const registeredBy = formatProvider(provider)
    showDialog({
      onDismiss: () => {
        hideDialog()
      },
      content: (
        <View style={styles.paragraphContainer}>
          <Paragraph
            style={[styles.paragraph, styles.paragraphBold]}
          >{`You Already Used\n This Email/mobile\n When You Signed Up\n With ${registeredBy}`}</Paragraph>
        </View>
      ),
      buttons: [
        {
          text: `Login with ${registeredBy}`,
          onPress: async () => {
            hideDialog()
            fireEvent(SIGNIN_TORUS_SUCCESS, { provider, source })
            await AsyncStorage.setItem(IS_LOGGED_IN, true)
            store.set('isLoggedIn')(true)
          },
          style: styles.marginBottom,
        },
        {
          text: 'Continue Signup',
          onPress: () => {
            hideDialog()
          },
          style: styles.whiteButton,
          textStyle: styles.primaryText,
        },
      ],
      buttonsContainerStyle: styles.modalButtonsContainerStyle,
      type: 'error',
    })
  }

  const successDialog = () => {
    showDialog({
      image: <SuccessIcon />,
      loading: true,
      message: 'Please wait\nThis might take a few seconds...',
      showButtons: false,
      title: `PREPARING\nYOUR WALLET`,
      showCloseButtons: false,
    })
  }

  const showUnregistedAccount = (provider, source, torusUser) => {
    const registeredBy = formatProvider(provider)
    showDialog({
      onDismiss: () => {
        hideDialog()
      },
      content: (
        <View style={styles.paragraphContainer}>
          <Paragraph
            style={[styles.paragraph, styles.paragraphBold]}
          >{`Hi There,\n did You Mean\n to Signup?`}</Paragraph>
          <View style={{ marginTop: mainTheme.sizes.defaultDouble }}>
            <Paragraph
              style={[styles.paragraph, styles.paragraphContent]}
            >{`The account doesn’t exist\n or you signed up using`}</Paragraph>
            <Paragraph style={[styles.paragraphContent, styles.paragraphBold]}>{`${registeredBy}`}</Paragraph>
          </View>
        </View>
      ),
      buttons: [
        {
          text: 'Signup',
          onPress: () => {
            fireEvent(SIGNUP_STARTED, { source, provider })
            navigate('Signup', {
              regMethod: REGISTRATION_METHOD_TORUS,
              torusUser,
              torusProvider: provider,
            })
          },
          style: [styles.whiteButton, { flex: 1 }],
          textStyle: styles.primaryText,
        },
        {
          text: 'Login',
          onPress: () => {
            hideDialog()
          },
          style: { flex: 1 },
        },
      ],
      buttonsContainerStyle: styles.modalButtonsContainerRow,
      type: 'error',
    })
  }

  const ready = async replacing => {
    const loginPromise = retryImport(() => import('../../../lib/login/GoodWalletLogin'))
    log.debug('ready: Starting initialization', { replacing })

    const { init } = await retryImport(() => import('../../../init'))
    log.debug('ready: got init', init)

    const { goodWallet, userStorage, source } = await init()
    log.debug('ready: done init')

    if (replacing) {
      log.debug('reinitializing wallet and storage with new user')

      goodWallet.init()
      await goodWallet.ready
      userStorage.init()
    }

    // for QA
    global.wallet = goodWallet

    await userStorage.ready
    log.debug('ready: userstorage ready')

    // the login also re-initialize the api with new jwt
    const { default: login } = await loginPromise
    log.debug('ready: got login', login)

    try {
      await login.auth()
    } catch (exception) {
      const { message } = exception

      log.error('failed auth:', message, exception)
    } finally {
      log.debug('ready: login ready')
    }

    return { goodWallet, userStorage, source }
  }

  const handleLoginMethod = useCallback(
    async (provider: 'facebook' | 'google' | 'google-old' | 'auth0' | 'auth0-pwdless-email' | 'auth0-pwdless-sms') => {
      let torusUser
      let replacing = false

      fireEvent(SIGNUP_METHOD_SELECTED, { method: provider })

      try {
        if (['development', 'test'].includes(config.env)) {
          torusUser = await AsyncStorage.getItem('TorusTestUser')
        }

        showLoadingDialog()

        if (torusUser == null) {
          torusUser = await torusSDK.triggerLogin(provider)
        }
        const curSeed = await AsyncStorage.getItem(GD_USER_MASTERSEED)
        const curMnemonic = await AsyncStorage.getItem(GD_USER_MNEMONIC)

        if (curMnemonic || (curSeed && curSeed !== torusUser.privateKey)) {
          await AsyncStorage.clear()
          replacing = true
        }

        //set masterseed so wallet can use it in 'ready' where we check if user exists
        await AsyncStorage.setItem(GD_USER_MASTERSEED, torusUser.privateKey)
        log.debug('torus login success', { torusUser })
      } catch (e) {
        // store.set('loadingIndicator')({ loading: false })

        if (e.message === 'user closed popup') {
          log.info(e.message, e)
        } else {
          log.error('torus login failed', e.message, e, { dialogShown: true })
        }

        showErrorDialog('We were unable to complete the signup. Please try again.')
        return
      }
      try {
        const { exists, fullName } = await userExists()

        // const userExists = await userStorage.userAlreadyExist()
        log.debug('checking userAlreadyExist', { exists, fullName })
        const { source } = await ready(replacing)

        log.debug('showing checkmark dialog')

        // showLoadingDialog(true)
        // await delay(30000000)

        // await new Promise(res => showLoadingDialog(true, res))
        // showLoadingDialog(true)
        // log.debug('hiding checkmark dialog')
        hideDialog()
        if (isSignUp) {
          if (exists) {
            return showEmailUsedDialog(provider, source)
          }
          fireEvent(SIGNUP_STARTED, { source, provider })
          return navigate('Signup', {
            regMethod: REGISTRATION_METHOD_TORUS,
            torusUser,
            torusProvider: provider,
          })
        }
        if (exists) {
          successDialog()
          await delay(2000)
          fireEvent(SIGNIN_TORUS_SUCCESS, { provider, source })
          await AsyncStorage.setItem(IS_LOGGED_IN, true)
          store.set('isLoggedIn')(true)
          hideDialog()
          return
        }
        return showUnregistedAccount(provider, source, torusUser)
      } catch (e) {
        log.error('Failed to initialize wallet and storage', e.message, e)
      } finally {
        store.set('loadingIndicator')({ loading: false })
      }
    },
    [store, torusSDK, showErrorDialog, navigate],
  )

  const goToManualRegistration = useCallback(async () => {
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

  const goToSignIn = useOnPress(() => navigate('SigninInfo'), [navigate])

  const goBack = useOnPress(() => navigate('Welcome'), [navigate])

  const handleNavigateTermsOfUse = useCallback(() => push('PrivacyPolicyAndTerms'), [push])

  const handleNavigatePrivacyPolicy = useCallback(() => push('PrivacyPolicy'), [push])

  // google button settings
  const googleButtonHandler = useMemo(() => (asGuest ? signupGoogle : goToW3Site), [asGuest, signupGoogle])

  // facebook button settings
  const facebookButtonHandler = useMemo(() => (asGuest ? signupFacebook : goToW3Site), [asGuest, signupFacebook])
  const facebookButtonTextStyle = useMemo(() => (asGuest ? undefined : styles.textBlack), [asGuest])

  const auth0ButtonHandler = useMemo(
    () =>
      asGuest
        ? () => {
            if (config.torusEmailEnabled) {
              setPasswordless(true)
              fireEvent(SIGNUP_METHOD_SELECTED, { method: 'auth0-pwdless' })
            } else {
              signupAuth0Mobile()
            }
          }
        : goToW3Site,
    [asGuest, signupAuth0, setPasswordless],
  )

  const signupAuth0Email = () => signupAuth0('email')
  const signupAuth0Mobile = () => signupAuth0('mobile')

  const ShowPasswordless = useMemo(
    () => () => {
      if (isPasswordless) {
        return (
          <Section.Row>
            <CustomButton
              color={mainTheme.colors.darkBlue}
              style={[styles.buttonText, styles.buttonLayout, { flex: 1, marginRight: getDesignRelativeWidth(5) }]}
              textStyle={[styles.buttonText]}
              onPress={signupAuth0Mobile}
              disabled={!sdkInitialized}
              testID="login_via_mobile"
              compact={isSmallDevice || isMediumDevice}
            >
              Via Phone Code
            </CustomButton>
            <CustomButton
              color={mainTheme.colors.darkBlue}
              style={[styles.buttonLayout, { flex: 1, marginLeft: getDesignRelativeWidth(5) }]}
              textStyle={[styles.buttonText]}
              onPress={signupAuth0Email}
              disabled={!sdkInitialized}
              testID="login_via_email"
              compact={isSmallDevice || isMediumDevice}
            >
              Via Email Code
            </CustomButton>
          </Section.Row>
        )
      }
      return (
        <TouchableOpacity
          style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.darkBlue }]}
          onPress={auth0ButtonHandler}
          disabled={!sdkInitialized}
          testID="login_with_auth0"
        >
          <View style={styles.iconBorder}>
            <Image source={mobileBtnIcon} resizeMode="contain" style={styles.iconsStyle} />
          </View>
          <Text textTransform="uppercase" style={styles.buttonText} fontWeight={500} letterSpacing={0} color="white">
            {`${isSignUp ? 'Agree & Sign Up' : 'Log in'} Passwordless`}
          </Text>
        </TouchableOpacity>
      )
    },
    [isPasswordless, torusSDK, auth0ButtonHandler],
  )
  return (
    <Screen
      screenProps={screenProps}
      navigation={navigation}
      asGuest={asGuest}
      handleNavigateTermsOfUse={handleNavigateTermsOfUse}
      handleNavigatePrivacyPolicy={handleNavigatePrivacyPolicy}
      goToManualRegistration={goToManualRegistration}
      googleButtonHandler={googleButtonHandler}
      sdkInitialized={sdkInitialized}
      facebookButtonTextStyle={facebookButtonTextStyle}
      facebookButtonHandler={facebookButtonHandler}
      ShowPasswordless={ShowPasswordless}
      goToSignIn={goToSignIn}
      goBack={goBack}
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
      color: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primary,
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
      padding: getDesignRelativeHeight(12),
    },
    iconsStyle: {
      width: getDesignRelativeHeight(20),
      height: getDesignRelativeHeight(20),
    },
  }
}
const auth = withStyles(getStylesFromProps)(SimpleStore.withStore(AuthTorus))
auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true,
}

export default auth
