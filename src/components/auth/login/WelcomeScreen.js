import React, { useCallback } from 'react'
import { View } from 'react-native'

// import logger from '../../../lib/logger/js-logger'
import { t, Trans } from '@lingui/macro'
import {
  fireEvent,
  SIGNIN_METHOD_SELECTED,
  SIGNIN_SELECTED,
  SIGNUP_METHOD_SELECTED,
  SIGNUP_SELECTED,
} from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED } from '../../../lib/constants/localStorage'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import { isBrowser } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'
import { getShadowStyles } from '../../../lib/utils/getStyles'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../../../lib/constants/login'
import CustomButton from '../../common/buttons/CustomButton'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import Illustration from '../../../assets/Auth/torusIllustration.svg'
import config from '../../../config/config'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  getMaxDeviceHeight,
  isSmallDevice,
} from '../../../lib/utils/sizes'
import Recover from '../../signin/Mnemonics'
import normalizeText from '../../../lib/utils/normalizeText'
import NavBar from '../../appNavigation/NavBar'
import { PrivacyPolicy, PrivacyPolicyAndTerms, Support } from '../../webView/webViewInstances'
import { createStackNavigator } from '../../appNavigation/stackNavigation'
import ready from '../ready'
import Auth from '../../auth/Auth'
import AuthTorus from '../../auth/torus/AuthTorus'

// const log = logger.child({ from: 'Welcome' })
const AuthType = config.torusEnabled ? AuthTorus : Auth

const WelcomeScreen = ({ styles, screenProps, navigation }) => {
  const { navigate } = navigation

  const goToSignUp = useCallback(() => {
    fireEvent(SIGNUP_SELECTED)

    const options = { screen: 'signup' }

    return navigate('Auth', options)
  }, [navigate])

  const goToSignIn = useCallback(() => {
    fireEvent(SIGNIN_SELECTED)
    return navigate('Auth', { screen: 'signin' })
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
      <NavBar title={t`Welcome to gooddollar!`} />
      <Text
        style={styles.headerText}
        fontSize={26}
        lineHeight={34}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
      >
        <Trans>Join and Claim G$ Daily.</Trans>
        <Trans>
          <Text fontSize={26} lineHeight={34} letterSpacing={0.26} fontFamily="Roboto">
            {"\nYes, it's that simple."}
          </Text>
        </Trans>
      </Text>
      <View style={styles.illustration}>
        <Illustration
          width={getDesignRelativeWidth(isBrowser ? 331 : 276, false)}
          height={getDesignRelativeHeight(217, false)}
          viewBox="0 0 248.327 194.594"
        />
      </View>
      <Section.Stack style={styles.bottomContainer}>
        {config.enableSelfCustody && (
          <>
            <Section.Row alignItems="center" justifyContent="center">
              <CustomButton
                textStyle={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' }}
                style={styles.minSpace}
                mode="text"
                onPress={goToManualRegistration}
              >
                <Trans>Agree & Continue with self custody wallet</Trans>
              </CustomButton>
            </Section.Row>
            <Section.Row alignItems="center" justifyContent="center" style={styles.signInLink}>
              <CustomButton
                textStyle={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: '500' }}
                style={styles.recoverText}
                mode="text"
                onPress={goToSignInInfo}
              >
                <Trans>Sign in</Trans>
              </CustomButton>
            </Section.Row>
          </>
        )}
        <>
          <Section.Row alignItems="center" justifyContent="center" style={styles.buttonSpace}>
            <CustomButton style={styles.buttonLayout} textStyle={styles.buttonText} onPress={goToSignUp}>
              <Trans>Sign up (Create new wallet)</Trans>
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
              <Trans>{'Already Have a Wallet? Log In >'}</Trans>
            </CustomButton>
          </Section.Row>
        </>
      </Section.Stack>
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
      flexGrow: 1,
    },
    bottomContainer: {
      marginTop: getDesignRelativeHeight(theme.sizes.default * 7, false),
      paddingHorizontal: theme.sizes.defaultDouble,
      justifyContent: 'flex-start',
      flex: 1,
    },
    buttonLayout: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      flex: 1,
      ...getShadowStyles('none', { elevation: 0 }),
    },
    buttonText: {
      fontSize: buttonFontSize,
    },
    illustration: {
      flex: 1,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 7, false),
      alignSelf: 'center',
    },
    headerText: {
      marginTop: getDesignRelativeHeight(!shorterDevice ? 45 : 30),
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
  title: t`Welcome to GoodDollar!`,
  navigationBarHidden: true,
}

const routes = {
  Auth: AuthType,
  PrivacyPolicyAndTerms,
  PrivacyPolicy,
  Support,
}

if (config.enableSelfCustody) {
  Object.assign(routes, { Recover })
}

export default createStackNavigator(routes, {
  backRouteName: 'Auth',
})
