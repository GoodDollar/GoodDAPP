// @flow
import React, { useCallback, useState } from 'react'
import { View } from 'react-native'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import { withStyles } from '../../../lib/styles'
import { theme as mainTheme } from '../../theme/styles'
import { isBrowser } from '../../../lib/utils/platform'
import AnimationsPeopleFlying from '../../common/animations/PeopleFlying'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getDesignRelativeWidth, getMaxDeviceHeight } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import normalizeText from '../../../lib/utils/normalizeText'
import googleBtnIcon from '../../../assets/Auth/btn_google.svg'
import facebookBtnIcon from '../../../assets/Auth/btn_facebook.svg'
import { PasswordLess } from '../torus/PasswordLess'
import { LoginButton } from './LoginButton'

// import { delay } from '../../../lib/utils/async'

// import SpinnerCheckMark from '../../common/animations/SpinnerCheckMark'

const SignupScreen = ({ screenProps, styles, store, handleLoginMethod, sdkInitialized, goBack }) => {
  const { push } = screenProps
  const [isPasswordless, setPasswordless] = useState(false)
  const handleNavigateTermsOfUse = useCallback(() => push('PrivacyPolicyAndTerms'), [push])

  const handleNavigatePrivacyPolicy = useCallback(() => push('PrivacyPolicy'), [push])

  const handlePasswordless = useCallback(() => {
    setPasswordless(true)
  }, [setPasswordless])

  const _goBack = useCallback(() => {
    if (isPasswordless) {
      return setPasswordless(false)
    }
    goBack()
  }, [goBack, setPasswordless, isPasswordless])

  const _google = useCallback(() => {
    handleLoginMethod('google')
  }, [handleLoginMethod])

  const _facebook = useCallback(() => {
    handleLoginMethod('facebook')
  }, [handleLoginMethod])

  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <View>
        <NavBar title="Signup" goBack={_goBack} />
        <Text
          style={styles.headerText}
          fontSize={26}
          lineHeight={34}
          letterSpacing={0.26}
          fontFamily="Roboto"
          fontWeight="bold"
        >
          Welcome to GoodDollar!
        </Text>
      </View>
      <View style={styles.illustration}>
        <AnimationsPeopleFlying />
      </View>
      <Section style={styles.bottomContainer}>
        <Text fontSize={12} color="gray80Percent" style={styles.marginBottom}>
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
        {isPasswordless === false && (
          <React.Fragment>
            <LoginButton
              style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.googleBlue }]}
              onPress={_google}
              disabled={!sdkInitialized}
              testID="login_with_google"
              icon={googleBtnIcon}
            >
              {`Agree & Sign up with Google`}
            </LoginButton>
            <LoginButton
              style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.facebookBlue }]}
              onPress={_facebook}
              disabled={!sdkInitialized}
              testID="login_with_facebook"
              icon={facebookBtnIcon}
            >
              {`Agree & Sign up with Facebook`}
            </LoginButton>
          </React.Fragment>
        )}
        <PasswordLess isOpen={isPasswordless} onSelect={handlePasswordless} handleLoginMethod={handleLoginMethod} />
      </Section>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)
  const shorterDevice = getMaxDeviceHeight() <= 622
  const illustrationSize = getDesignRelativeWidth(isBrowser ? 429 : shorterDevice ? 249 : 350)

  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'space-between',
      flexGrow: 1,
    },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
      paddingBottom: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : theme.sizes.default),
      justifyContent: 'space-around',
      paddingTop: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : theme.sizes.default),
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
    iconsStyle: {
      width: getDesignRelativeHeight(20),
      height: getDesignRelativeHeight(20),
    },
    iconBorder: {
      backgroundColor: theme.colors.white,
      borderRadius: 50,
      alignItems: 'center',
      padding: getDesignRelativeHeight(12),
    },
    buttonText: {
      fontSize: buttonFontSize,
      flex: 1,
      lineHeight: getDesignRelativeHeight(19),
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginTop: getDesignRelativeHeight(theme.sizes.defaultDouble),
      width: illustrationSize,
      height: getDesignRelativeHeight(192),
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingRight: getDesignRelativeWidth(15),
      flex: 1,
      justifyContent: 'center',
    },
    headerText: {
      marginTop: getDesignRelativeHeight(!shorterDevice ? 45 : 30),
      marginBottom: getDesignRelativeHeight(20),
    },
    marginBottom: {
      marginBottom: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : theme.sizes.default),
    },
    fixMargin: {
      marginVertical: -6,
      marginHorizontal: -13,
    },
  }
}

const signupScreen = withStyles(getStylesFromProps)(SimpleStore.withStore(SignupScreen))

signupScreen.navigationOptions = {
  title: 'Signup',
  navigationBarHidden: false,
}

export default signupScreen
