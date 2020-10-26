/*eslint-disable*/
import React, { useCallback } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import logger from '../../../lib/logger/pino-logger'
import { fireEvent, SIGNIN_SELECTED, SIGNUP_SELECTED } from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED } from '../../../lib/constants/localStorage'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import { isBrowser, isMobileNative } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../../../lib/constants/login'
import CustomButton from '../../common/buttons/CustomButton'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import Illustration from '../../../assets/Auth/torusIllustration.svg'
import config from '../../../config/config'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getDesignRelativeWidth, getMaxDeviceHeight } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import Recover from '../../signin/Mnemonics'
import normalizeText from '../../../lib/utils/normalizeText'
import NavBar from '../../appNavigation/NavBar'
import { PrivacyPolicy, PrivacyPolicyAndTerms, SupportForUnsigned } from '../../webView/webViewInstances'
import { createStackNavigator } from '../../appNavigation/stackNavigation'
import ready from '../torus/ready'
import SignInScreen from '../login/SignInScreen'
import SignupScreen from '../login/SignUpScreen'
import Auth from '../../auth/Auth'
import AuthTorus from '../../auth/torus/AuthTorus'

const log = logger.child({ from: 'Welcome' })
const AuthType = config.torusEnabled ? AuthTorus : Auth

const WelcomeScreen = ({ styles, screenProps, navigation }) => {
  const { navigate } = navigation

  const goToSignUp = () => {
    fireEvent(SIGNUP_SELECTED)
    return navigate('Auth', { screen: 'signup' })
  }

  const goToSignIn = () => {
    fireEvent(SIGNIN_SELECTED)
    return navigate(isMobileNative ? 'SigninInfo' : 'Auth', { screen: 'signin' })
  }

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

  const goToSignInInfo = () => navigate('SigninInfo')

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
      <View style={styles.illustration}>
        <Illustration />
      </View>
      {/* <Image source={Illustration} style={styles.illustration} resizeMode="contain" /> */}
      <Section style={styles.bottomContainer}>
        {config.enableSelfCustody && (
          <>
            <Section.Row alignItems="center" justifyContent="center">
              <TouchableOpacity onPress={goToManualRegistration}>
                <Section.Text
                  fontWeight="medium"
                  style={styles.minSpace}
                  textDecorationLine="underline"
                  color="primary"
                  fontSize={14}
                >
                  Agree & Continue with self custody wallet
                </Section.Text>
              </TouchableOpacity>
            </Section.Row>
            <Section.Row alignItems="center" justifyContent="center" style={styles.signInLink}>
              <TouchableOpacity onPress={goToSignInInfo}>
                <Section.Text
                  fontWeight="medium"
                  style={styles.recoverText}
                  textDecorationLine="underline"
                  color="primary"
                  fontSize={14}
                >
                  Sign in
                </Section.Text>
              </TouchableOpacity>
            </Section.Row>
          </>
        )}
        <>
          <Section.Row alignItems="center" justifyContent="center" style={styles.buttonSpace}>
            <CustomButton style={styles.buttonLayout} textStyle={styles.buttonText} onPress={goToSignUp}>
              Sign up (Create new wallet)
            </CustomButton>
          </Section.Row>
          <Section.Row alignItems="center" justifyContent="center">
            <TouchableOpacity onPress={goToSignIn}>
              <Section.Text
                fontWeight="bold"
                style={styles.recoverText}
                textDecorationLine="underline"
                color="darkGray"
                fontSize={14}
              >
                {'Already Have a Wallet? Log In >'}
              </Section.Text>
            </TouchableOpacity>
          </Section.Row>
        </>
      </Section>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)
  const shorterDevice = getMaxDeviceHeight() <= 622

  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'space-between',
      flexGrow: 1,
    },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
      paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
      justifyContent: 'space-around',
      marginBottom: getDesignRelativeHeight(10),
    },
    buttonLayout: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      flex: 1,
      boxShadow: 'none',
    },
    buttonText: {
      fontSize: buttonFontSize,
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      width: getDesignRelativeWidth(isBrowser ? 331 : 276),
      height: getDesignRelativeHeight(217),
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingTop: getDesignRelativeHeight(theme.sizes.default),
      alignItems: 'center',
    },
    headerText: {
      marginTop: getDesignRelativeHeight(!shorterDevice ? 45 : 30),
      marginBottom: getDesignRelativeHeight(20),
    },
    buttonSpace: {
      marginBottom: getDesignRelativeHeight(15),
    },
    recoverText: {
      marginBottom: getDesignRelativeHeight(15),
    },
    minSpace: {
      marginBottom: getDesignRelativeHeight(5),
    },
  }
}

const welcome = withStyles(getStylesFromProps)(SimpleStore.withStore(WelcomeScreen))

welcome.navigationOptions = {
  title: 'Welcome to GoodDollar!',
  navigationBarHidden: true,
}

const routes = {
  Welcome: welcome,
  Auth: AuthType,
  PrivacyPolicyAndTerms,
  PrivacyPolicy,
  Support: SupportForUnsigned,
  SignInScreen,
  SignupScreen,
}

if (config.enableSelfCustody) {
  Object.assign(routes, { Recover })
}

export default createStackNavigator(routes, {
  backRouteName: 'Welcome',
})
