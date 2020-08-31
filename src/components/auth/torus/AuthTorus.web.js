// @flow
/*eslint-disable*/
import React, { useCallback, useMemo, useState } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import logger from '../../../lib/logger/pino-logger'
import {
  CLICK_BTN_GETINVITED,
  fireEvent,
  SIGNIN_TORUS_SUCCESS,
  SIGNUP_METHOD_SELECTED,
  SIGNUP_STARTED,
} from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC, IS_LOGGED_IN } from '../../../lib/constants/localStorage'
import { REGISTRATION_METHOD_SELF_CUSTODY, REGISTRATION_METHOD_TORUS } from '../../../lib/constants/login'
import CustomButton from '../../common/buttons/CustomButton'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import Recover from '../../signin/Mnemonics'
import { PrivacyPolicy, PrivacyPolicyAndTerms, SupportForUnsigned } from '../../webView/webViewInstances'
import { createStackNavigator } from '../../appNavigation/stackNavigation'
import { withStyles } from '../../../lib/styles'
import illustration from '../../../assets/Auth/torusIllustration.svg'
import config from '../../../config/config'
import { theme as mainTheme } from '../../theme/styles'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { useDialog } from '../../../lib/undux/utils/dialog'
import retryImport from '../../../lib/utils/retryImport'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import normalizeText from '../../../lib/utils/normalizeText'
import { isBrowser } from '../../../lib/utils/platform'
import { userExists } from '../../../lib/login/userExists'

// import { delay } from '../../../lib/utils/async'
import LoadingIcon from '../../common/modal/LoadingIcon'

// import SpinnerCheckMark from '../../common/animations/SpinnerCheckMark'

import useTorus from './hooks/useTorus'

Image.prefetch(illustration)

const log = logger.child({ from: 'AuthTorus' })

const AuthTorus = ({ screenProps, navigation, styles, store }) => {
  const asGuest = true
  const [isPasswordless, setPasswordless] = useState(false)
  const [showDialog, hideDialog, showErrorDialog] = useDialog()
  const [torusSDK, sdkInitialized] = useTorus()
  const { navigate } = navigation
  const { push } = screenProps

  const goToW3Site = () => {
    fireEvent(CLICK_BTN_GETINVITED)
    window.location = config.web3SiteUrl
  }

  //login so we can check if user exists
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

  const signupGoogle = () => handleSignUp(config.isPhaseZero ? 'google-old' : 'google')
  const signupFacebook = () => handleSignUp('facebook')
  const signupAuth0 = loginType => handleSignUp(loginType === 'email' ? 'auth0-pwdless-email' : 'auth0-pwdless-sms')

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

  // const showLoadingDialog = (success = false, onFinish = () => {}, onStart = () => {}) => {
  //   showDialog({
  //     image: (
  //       <View style={{ flex: 1, alignItems: 'center' }}>
  //         <SpinnerCheckMark
  //           successSpeed={3}
  //           loading={true}
  //           success={success}
  //           onFinish={onFinish}
  //           onStart={onStart}
  //           height={'auto'}
  //           marginTop={0}
  //         />
  //       </View>
  //     ),

  //     loading: true,
  //     message: 'Please wait\nThis might take a few seconds...',
  //     showButtons: false,
  //     title: `PREPARING\nYOUR WALLET`,
  //   })
  // }

  const handleSignUp = useCallback(
    async (provider: 'facebook' | 'google' | 'google-old' | 'auth0' | 'auth0-pwdless-email' | 'auth0-pwdless-sms') => {
      // store.set('loadingIndicator')({ loading: true })

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

        showErrorDialog('We were unable to complete the login. Please try again.')
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

        //user exists reload with dashboard route
        if (exists) {
          fireEvent(SIGNIN_TORUS_SUCCESS, { provider, source })
          await AsyncStorage.setItem(IS_LOGGED_IN, true)
          store.set('isLoggedIn')(true)
          return
        }

        //user doesnt exists start signup
        fireEvent(SIGNUP_STARTED, { source, provider })
        navigate('Signup', {
          regMethod: REGISTRATION_METHOD_TORUS,
          torusUser,
          torusProvider: provider,
        })

        //Hack to get keyboard up on mobile need focus from user event such as click
        setTimeout(() => {
          const el = document.getElementById('Name_input')
          if (el) {
            el.focus()
          }
        }, 500)
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

  const goToSignIn = useCallback(() => {
    navigate('SigninInfo')
  }, [navigate])

  const handleNavigateTermsOfUse = useCallback(() => push('PrivacyPolicyAndTerms'), [push])

  const handleNavigatePrivacyPolicy = useCallback(() => push('PrivacyPolicy'), [push])

  // google button settings
  const googleButtonHandler = useMemo(() => (asGuest ? signupGoogle : goToW3Site), [asGuest, signupGoogle])
  const googleButtonTextStyle = useMemo(() => (asGuest ? undefined : styles.textBlack), [asGuest])

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
              compact={isSmallDevice}
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
              compact={isSmallDevice}
            >
              Via Email Code
            </CustomButton>
          </Section.Row>
        )
      }
      return (
        <CustomButton
          color={mainTheme.colors.darkBlue}
          style={styles.buttonLayout}
          textStyle={[styles.buttonText]}
          onPress={auth0ButtonHandler}
          disabled={!sdkInitialized}
          testID="login_with_auth0"
        >
          Agree & Continue Passwordless
        </CustomButton>
      )
    },
    [isPasswordless, torusSDK, auth0ButtonHandler],
  )
  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <NavBar title="Welcome to gooddollar!" />
      <Text
        style={styles.headerText}
        fontSize={26}
        lineHeight={34}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
      >
        Join and Claim G$ Daily.
        <Text fontSize={26} lineHeight={34} letterSpacing={0.26} fontFamily="Roboto">
          {"\nYes, it's that simple."}
        </Text>
      </Text>
      <Image source={illustration} style={styles.illustration} resizeMode="contain" />
      <Section style={styles.bottomContainer}>
        {asGuest && (
          <Text fontSize={12} color="gray80Percent" style={styles.privacyAndTerms}>
            {`By Signing up you are accepting our \n`}
            <Text
              fontSize={12}
              color="gray80Percent"
              fontWeight="bold"
              textDecorationLine="underline"
              onPress={handleNavigateTermsOfUse}
            >
              Terms of Use
            </Text>
            {' and '}
            <Text
              fontSize={12}
              color="gray80Percent"
              fontWeight="bold"
              textDecorationLine="underline"
              onPress={handleNavigatePrivacyPolicy}
            >
              Privacy Policy
            </Text>
          </Text>
        )}
        {config.enableSelfCustody && (
          <>
            <Section.Row alignItems="center" justifyContent="center">
              <TouchableOpacity onPress={goToManualRegistration}>
                <Section.Text
                  fontWeight="medium"
                  style={styles.recoverText}
                  textStyle={[styles.buttonText]}
                  textDecorationLine="underline"
                  fontSize={14}
                  color="primary"
                >
                  Agree & Continue with self custody wallet
                </Section.Text>
              </TouchableOpacity>
            </Section.Row>
            <Section.Row alignItems="center" justifyContent="center" style={styles.signInLink}>
              <TouchableOpacity onPress={goToSignIn}>
                <Section.Text
                  fontWeight="medium"
                  style={styles.haveIssuesText}
                  textStyle={[styles.buttonText]}
                  textDecorationLine="underline"
                  fontSize={14}
                  color="primary"
                >
                  Sign in
                </Section.Text>
              </TouchableOpacity>
            </Section.Row>
          </>
        )}
        <CustomButton
          color={mainTheme.colors.googleRed}
          style={styles.buttonLayout}
          textStyle={[styles.buttonText, googleButtonTextStyle]}
          onPress={googleButtonHandler}
          disabled={!sdkInitialized}
          testID="login_with_google"
        >
          Agree & Continue with Google
        </CustomButton>
        <CustomButton
          color={mainTheme.colors.facebookBlue}
          style={styles.buttonLayout}
          textStyle={[styles.buttonText, facebookButtonTextStyle]}
          onPress={facebookButtonHandler}
          disabled={!sdkInitialized}
          testID="login_with_facebook"
        >
          Agree & Continue with Facebook
        </CustomButton>
        <ShowPasswordless />
      </Section>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  const buttonFontSize = normalizeText(isSmallDevice ? 15 : 16)

  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'space-between',
      flexGrow: 1,
    },
    textBlack: {
      color: theme.fontStyle.color,
    },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
      paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    },
    buttonLayout: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
    },
    buttonText: {
      fontSize: buttonFontSize,
    },
    acceptTermsLink: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      width: getDesignRelativeWidth(249),
      height: getDesignRelativeHeight(isBrowser ? 195 : 150),
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingTop: getDesignRelativeHeight(theme.sizes.default),
    },
    headerText: {
      marginTop: getDesignRelativeHeight(30),
      marginBottom: getDesignRelativeHeight(20),
    },
    privacyAndTerms: {
      marginBottom: getDesignRelativeHeight(16),
    },
    signInLink: {
      marginTop: getDesignRelativeHeight(5),
      marginBottom: getDesignRelativeHeight(5),
    },
  }
}
const auth = withStyles(getStylesFromProps)(SimpleStore.withStore(AuthTorus))
auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true,
}

const routes = {
  Login: auth,
  PrivacyPolicyAndTerms,
  PrivacyPolicy,
  Support: SupportForUnsigned,
}

if (config.enableSelfCustody) {
  Object.assign(routes, { Recover })
}

export default createStackNavigator(routes, {
  backRouteName: 'Auth',
})
