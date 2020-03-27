// @flow
import React from 'react'
import { AsyncStorage, Image } from 'react-native'
import logger from '../../lib/logger/pino-logger'
import { CLICK_BTN_GETINVITED, fireEvent, SIGNIN_TORUS_SUCCESS, SIGNUP_STARTED } from '../../lib/analytics/analytics'
import { GD_USER_MASTERSEED, IS_LOGGED_IN } from '../../lib/constants/localStorage'
import CustomButton from '../common/buttons/CustomButton'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import NavBar from '../appNavigation/NavBar'
import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import illustration from '../../assets/Auth/torusIllustration.svg'
import config from '../../config/config'
import { theme as mainTheme } from '../theme/styles'
import Section from '../common/layout/Section'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import retryImport from '../../lib/utils/retryImport'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { torusGoogle, useTorusServiceWorker } from './useTorus'

Image.prefetch(illustration)
const log = logger.child({ from: 'AuthTorus' })
const AuthTorus = ({ screenProps, navigation, styles, store }) => {
  const asGuest = true
  const [showErrorDialog] = useErrorDialog()
  const torusReady = useTorusServiceWorker()

  const goToW3Site = () => {
    fireEvent(CLICK_BTN_GETINVITED)
    window.location = config.web3SiteUrl
  }

  //login so we can check if user exists
  const ready = async () => {
    log.debug('ready: Starting initialization')
    const { init } = await retryImport(() => import('../../init'))
    log.debug('ready: got init', init)
    const login = retryImport(() => import('../../lib/login/GoodWalletLogin'))
    log.debug('ready: got login', login)
    const { goodWallet, userStorage, source } = await init()
    log.debug('ready: done init')

    //for QA
    global.wallet = goodWallet
    await userStorage.ready
    log.debug('ready: userstorage ready')

    //the login also re-initialize the api with new jwt
    await login
      .then(l => l.default.auth())
      .catch(e => {
        log.error('failed auth:', e.message, e)

        // showErrorDialog('Failed authenticating with server', e)
      })
    log.debug('ready: login ready')

    return { goodWallet, userStorage, source }
  }

  const handleSignUp = async () => {
    store.set('loadingIndicator')({ loading: true })
    const redirectTo = 'Phone'
    let torusUser
    try {
      torusUser = await torusGoogle.triggerLogin()

      //set masterseed so wallet can use it in 'ready' where we check if user exists
      await AsyncStorage.setItem(GD_USER_MASTERSEED, torusUser.privateKey)
      log.debug('torus login success', { torusUser })
    } catch (e) {
      store.set('loadingIndicator')({ loading: false })
      log.error('torus login failed', e.message, e)
      showErrorDialog('We were unable to complete the login. Please try again.')
      return
    }

    try {
      const { userStorage, source } = await ready()
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
      fireEvent(SIGNUP_STARTED, { source })
      navigation.navigate(redirectTo, { torusUser })

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
  }

  const handleNavigateTermsOfUse = () => screenProps.push('TermsOfUse')

  const handleNavigatePrivacyPolicy = () => screenProps.push('PrivacyPolicy')

  // google button settings
  const googleButtonHandler = asGuest ? handleSignUp : goToW3Site
  const googleButtonText = asGuest ? (
    'Login with Google'
  ) : (
    <Text style={styles.buttonText} fontWeight="medium">
      NEW HERE?
      <Text style={styles.buttonText} fontWeight="black">
        {' GET INVITED'}
      </Text>
    </Text>
  )
  const googleButtonTextStyle = asGuest ? undefined : styles.textBlack

  // facebook button settings
  const facebookButtonHandler = asGuest ? handleSignUp : goToW3Site
  const facebookButtonText = 'Login with Facebook'
  const facebookButtonTextStyle = asGuest ? undefined : styles.textBlack

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
            {'By Signing up you are accepting our\n'}
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
        <CustomButton
          color={mainTheme.colors.googleRed}
          style={styles.buttonLayout}
          textStyle={googleButtonTextStyle}
          onPress={googleButtonHandler}
          disabled={torusReady === false}
        >
          {googleButtonText}
        </CustomButton>
        <CustomButton
          color={mainTheme.colors.facebookBlue}
          style={styles.buttonLayout}
          textStyle={facebookButtonTextStyle}
          onPress={facebookButtonHandler}
          disabled={torusReady === false}
        >
          {facebookButtonText}
        </CustomButton>
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
      marginVertical: theme.sizes.default,
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
  }
}
const auth = withStyles(getStylesFromProps)(SimpleStore.withStore(AuthTorus))
auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true,
}
export default createStackNavigator(
  {
    Login: auth,
    TermsOfUse,
    PrivacyPolicy,
    Support,
  },
  {
    backRouteName: 'Auth',
  }
)
