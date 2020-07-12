// @flow
import React, { useCallback, useMemo, useState } from 'react'
import { AsyncStorage, Image, TouchableOpacity } from 'react-native'
import logger from '../../../lib/logger/pino-logger'
import {
  CLICK_BTN_GETINVITED,
  fireEvent,
  identifyOnUserSignup,
  SIGNIN_TORUS_SUCCESS,
  SIGNUP_STARTED,
} from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED, IS_LOGGED_IN } from '../../../lib/constants/localStorage'
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
import { useErrorDialog } from '../../../lib/undux/utils/dialog'
import retryImport from '../../../lib/utils/retryImport'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import useTorus from './hooks/useTorus'

Image.prefetch(illustration)

const log = logger.child({ from: 'AuthTorus' })

const AuthTorus = ({ screenProps, navigation, styles, store }) => {
  const asGuest = true
  const [isPasswordless, setPasswordless] = useState(false)
  const [showErrorDialog] = useErrorDialog()
  const [torusSDK, sdkInitialized] = useTorus()
  const { navigate } = navigation
  const { push } = screenProps

  const goToW3Site = () => {
    fireEvent(CLICK_BTN_GETINVITED)
    window.location = config.web3SiteUrl
  }

  //login so we can check if user exists
  const ready = async replacing => {
    log.debug('ready: Starting initialization', { replacing })
    const { init } = await retryImport(() => import('../../../init'))
    log.debug('ready: got init', init)
    const login = retryImport(() => import('../../../lib/login/GoodWalletLogin'))
    log.debug('ready: got login', login)
    const { goodWallet, userStorage, source } = await init()
    log.debug('ready: done init')

    if (replacing) {
      log.debug('reinitializing wallet and storage with new user')
      goodWallet.init()
      await goodWallet.ready
      await userStorage.init()
    }

    //for QA
    global.wallet = goodWallet
    await userStorage.ready
    log.debug('ready: userstorage ready')

    //the login also re-initialize the api with new jwt
    login
      .then(l => l.default.auth())
      .catch(e => {
        log.error('failed auth:', e.message, e)

        // showErrorDialog('Failed authenticating with server', e)
      })
    log.debug('ready: login ready')

    return { goodWallet, userStorage, source }
  }

  const signupGoogle = () => handleSignUp(config.isPhaseZero ? 'google-old' : 'google')
  const signupFacebook = () => handleSignUp('facebook')
  const signupAuth0 = loginType => handleSignUp(loginType === 'email' ? 'auth0-pwdless-email' : 'auth0-pwdless-sms')

  const handleSignUp = useCallback(
    async (provider: 'facebook' | 'google' | 'google-old' | 'auth0' | 'auth0-pwdless-email' | 'auth0-pwdless-sms') => {
      store.set('loadingIndicator')({ loading: true })
      const redirectTo = 'Name'
      let torusUser
      let replacing = false

      try {
        if (['development', 'test'].includes(config.env)) {
          torusUser = await AsyncStorage.getItem('TorusTestUser').then(JSON.parse)
        }

        if (torusUser == null) {
          torusUser = await torusSDK.triggerLogin(provider)
        }

        identifyOnUserSignup(torusUser.email)
        const curSeed = await AsyncStorage.getItem(GD_USER_MASTERSEED)

        if (curSeed && curSeed !== torusUser.privateKey) {
          await AsyncStorage.clear()
          replacing = true
        }

        //set masterseed so wallet can use it in 'ready' where we check if user exists
        await AsyncStorage.setItem(GD_USER_MASTERSEED, torusUser.privateKey)
        log.debug('torus login success', { torusUser })
      } catch (e) {
        store.set('loadingIndicator')({ loading: false })

        if (e.message === 'user closed popup') {
          log.info(e.message, e)
        } else {
          log.error('torus login failed', e.message, e, { dialogShown: true })
        }

        showErrorDialog('We were unable to complete the login. Please try again.')
        return
      }

      try {
        const { userStorage, source } = await ready(replacing)
        const userExists = await userStorage.userAlreadyExist()
        log.debug('checking userAlreadyExist', { userExists })

        //user exists reload with dashboard route
        if (userExists) {
          fireEvent(SIGNIN_TORUS_SUCCESS)
          await AsyncStorage.setItem(IS_LOGGED_IN, true)
          store.set('isLoggedIn')(true)
          return
        }

        //user doesnt exists start signup
        fireEvent(SIGNUP_STARTED, { source, provider })
        navigate(redirectTo, {
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
    [store, torusSDK, showErrorDialog, navigate]
  )

  const goToManualRegistration = useCallback(() => {
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

  const auth0ButtonHandler = useMemo(() => (asGuest ? () => setPasswordless(true) : goToW3Site), [
    asGuest,
    signupAuth0,
    setPasswordless,
  ])

  const signupAuth0Email = () => signupAuth0('email')
  const signupAuth0Mobile = () => signupAuth0('mobile')

  const ShowPasswordless = useMemo(
    () => () => {
      if (isPasswordless) {
        return (
          <Section.Row>
            <CustomButton
              color={mainTheme.colors.darkGray}
              style={[styles.buttonLayout, { flex: 1 }]}
              onPress={signupAuth0Email}
              disabled={!sdkInitialized}
              testID="login_via_email"
            >
              Via Email
            </CustomButton>
            <CustomButton
              color={mainTheme.colors.darkGray}
              style={[styles.buttonLayout, { flex: 1 }]}
              onPress={signupAuth0Mobile}
              disabled={!sdkInitialized}
              testID="login_via_mobile"
            >
              Via Mobile
            </CustomButton>
          </Section.Row>
        )
      }
      return (
        <CustomButton
          color={mainTheme.colors.darkGray}
          style={styles.buttonLayout}
          onPress={auth0ButtonHandler}
          disabled={!sdkInitialized}
          testID="login_with_auth0"
        >
          Agree & Continue with Passwordless
        </CustomButton>
      )
    },
    [isPasswordless, torusSDK, auth0ButtonHandler]
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
          textStyle={googleButtonTextStyle}
          onPress={googleButtonHandler}
          disabled={!sdkInitialized}
          testID="login_with_google"
        >
          Agree & Continue with Google
        </CustomButton>
        <CustomButton
          color={mainTheme.colors.facebookBlue}
          style={styles.buttonLayout}
          textStyle={facebookButtonTextStyle}
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
      paddingBottom: theme.sizes.defaultDouble,
    },
    buttonLayout: {
      marginTop: theme.sizes.default,
      marginBottom: theme.sizes.default,
    },
    buttonText: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1,
      letterSpacing: 0,
    },
    acceptTermsLink: {
      marginTop: theme.sizes.default,
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginBottom: theme.sizes.default,
      width: '100%',
      maxHeight: getDesignRelativeHeight(240),
      paddingTop: theme.sizes.default,
    },
    headerText: {
      marginTop: getDesignRelativeHeight(30),
      marginBottom: getDesignRelativeHeight(30),
    },
    privacyAndTerms: {
      marginBottom: 20,
    },
    signInLink: {
      marginTop: 5,
      marginBottom: 5,
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
