/*eslint-disable*/
import React from 'react'
import { Image, TouchableOpacity } from 'react-native'
import logger from '../../../lib/logger/pino-logger'
import { fireEvent, SIGNIN_METHOD_SELECTED, SIGNUP_METHOD_SELECTED } from '../../../lib/analytics/analytics'
import { isBrowser } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../../../lib/constants/login'
import CustomButton from '../../common/buttons/CustomButton'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import illustration from '../../../assets/Auth/torusIllustration.svg'
import config from '../../../config/config'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import Recover from '../../signin/Mnemonics'
import normalizeText from '../../../lib/utils/normalizeText'
import NavBar from '../../appNavigation/NavBar'
import { PrivacyPolicy, PrivacyPolicyAndTerms, SupportForUnsigned } from '../../webView/webViewInstances'
import { createStackNavigator } from '../../appNavigation/stackNavigation'
import SignInScreen from '../login/SignInScreen'
import SignupScreen from '../login/SignUpScreen'
import Auth from '../../auth/Auth'
import AuthTorus from '../../auth/torus/AuthTorus'

const log = logger.child({ from: 'Welcome' })
const AuthType = config.torusEnabled ? AuthTorus : Auth

const WelcomeScreen = ({ styles, screenProps, navigation }) => {
  const { navigate } = navigation

  const goToSignUp = () => {
    fireEvent(SIGNUP_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })
    return navigate('Auth', { screen: SIGNUP_METHOD_SELECTED })
  }

  const goToSignIn = () => {
    fireEvent(SIGNIN_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })
    return navigate('Auth', { screen: SIGNIN_METHOD_SELECTED })
  }

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
                textStyle={[styles.buttonText]}
                textDecorationLine="underline"
                fontSize={14}
                color="darkGray"
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
      minHeight: getDesignRelativeHeight(150),
      marginBottom: getDesignRelativeHeight(30),
    },
    buttonLayout: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      flex: 1,
    },
    buttonText: {
      fontSize: buttonFontSize,
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
    buttonSpace: {
      marginBottom: getDesignRelativeHeight(30),
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
