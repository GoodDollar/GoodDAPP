/*eslint-disable*/
import React, { useCallback } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import logger from '../../../lib/logger/pino-logger'
import {
  fireEvent,
  SIGNIN_SELECTED,
  SIGNIN_METHOD_SELECTED,
  SIGNUP_SELECTED,
  SIGNUP_METHOD_SELECTED,
} from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED } from '../../../lib/constants/localStorage'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import { isBrowser, isIOSNative } from '../../../lib/utils/platform'
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
import ready from '../ready'
import Auth from '../../auth/Auth'
import AuthTorus from '../../auth/torus/AuthTorus'

const log = logger.child({ from: 'Welcome' })
const AuthType = config.torusEnabled ? AuthTorus : Auth

const WelcomeScreen = ({ styles, screenProps, navigation }) => {
  const { navigate } = navigation

  const goToSignUp = useCallback(() => {
    fireEvent(SIGNUP_SELECTED)

    const options = { screen: 'signup' }
    if (isIOSNative) options.regMethod = REGISTRATION_METHOD_SELF_CUSTODY

    return navigate(isIOSNative ? 'Signup' : 'Auth', options)
  }, [navigate])

  const goToSignIn = useCallback(() => {
    fireEvent(SIGNIN_SELECTED)
    return navigate(isIOSNative ? 'SigninInfo' : 'Auth', { screen: 'signin' })
  }, [navigate])

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

  const goToSignInInfo = useCallback(() => {
    fireEvent(SIGNIN_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })
    navigate('SigninInfo')
  }, [navigate])

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
        <Illustration
          width={getDesignRelativeWidth(isBrowser ? 331 : 276)}
          height={getDesignRelativeHeight(217)}
          viewBox="0 0 248.327 194.594"
        />
      </View>
      <Section style={styles.bottomContainer}>
        {config.enableSelfCustody && (
          <>
            <Section.Row alignItems="center" justifyContent="center">
              <CustomButton
                textStyle={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' }}
                style={styles.minSpace}
                mode="text"
                onPress={goToManualRegistration}
              >
                Agree & Continue with self custody wallet
              </CustomButton>
            </Section.Row>
            <Section.Row alignItems="center" justifyContent="center" style={styles.signInLink}>
              <CustomButton
                textStyle={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' }}
                style={styles.recoverText}
                mode="text"
                onPress={goToSignInInfo}
              >
                Sign in
              </CustomButton>
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
            <CustomButton
              textStyle={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: 'bold' }}
              style={styles.recoverText}
              mode="text"
              onPress={goToSignIn}
              color="darkGray"
            >
              {'Already Have a Wallet? Log In >'}
            </CustomButton>
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
      marginBottom: getDesignRelativeHeight(5),
    },
    recoverText: {
      marginBottom: getDesignRelativeHeight(5),
    },
    minSpace: {
      marginBottom: 0,
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
}

if (config.enableSelfCustody) {
  Object.assign(routes, { Recover })
}

export default createStackNavigator(routes, {
  backRouteName: 'Welcome',
})
