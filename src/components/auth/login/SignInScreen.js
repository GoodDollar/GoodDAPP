// @flow
import React, { useCallback, useState } from 'react'
import { View } from 'react-native'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import { withStyles } from '../../../lib/styles'
import Illustration from '../../../assets/Auth/Illustrations_woman_love.svg'
import GoogleBtnIcon from '../../../assets/Auth/btn_google.svg'
import FacebookBtnIcon from '../../../assets/Auth/btn_facebook.svg'
import { theme as mainTheme } from '../../theme/styles'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getDesignRelativeWidth, getMaxDeviceHeight } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import normalizeText from '../../../lib/utils/normalizeText'
import { isBrowser } from '../../../lib/utils/platform'
import { PasswordLess } from '../torus/PasswordLess'
import { LoginButton } from './LoginButton'

const SigninScreen = ({ styles, store, handleLoginMethod, sdkInitialized, goBack }) => {
  const [isPasswordless, setPasswordless] = useState(false)

  const handlePasswordless = useCallback(() => {
    setPasswordless(true)
  }, [setPasswordless])

  const _goBack = useCallback(() => {
    if (isPasswordless) {
      return setPasswordless(false)
    }
    goBack()
  }, [setPasswordless, isPasswordless, goBack])

  const _google = () => handleLoginMethod('google')

  const _facebook = () => handleLoginMethod('facebook')

  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <NavBar title="Login" goBack={_goBack} />
      <Text
        style={styles.headerText}
        fontSize={26}
        lineHeight={34}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
      >
        Welcome Back!
      </Text>

      <View style={styles.illustration}>
        <Illustration
          width={getDesignRelativeWidth(isBrowser ? 290 : 206)}
          height={getDesignRelativeHeight(172)}
          viewBox="0 0 206.391 173.887"
        />
      </View>

      <Section style={styles.bottomContainer}>
        <Text fontSize={12} color="gray80Percent" style={styles.privacyAndTerms}>
          {`Remember to login with the `}
          <Text fontSize={12} color="gray80Percent" fontWeight="bold">
            {`same login method\n`}
          </Text>
          that you’ve signed up with
        </Text>
        {isPasswordless === false && (
          <>
            <LoginButton
              style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.googleBlue }]}
              onPress={_google}
              disabled={!sdkInitialized}
              testID="login_with_google"
              icon={GoogleBtnIcon}
            >
              Log in with Google
            </LoginButton>
            <LoginButton
              style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.facebookBlue }]}
              onPress={_facebook}
              disabled={!sdkInitialized}
              testID="login_with_facebook"
              icon={FacebookBtnIcon}
            >
              Log in with Facebook
            </LoginButton>
          </>
        )}
        <PasswordLess
          isSignup={false}
          isOpen={isPasswordless}
          onSelect={handlePasswordless}
          handleLoginMethod={handleLoginMethod}
        />
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

      // justifyContent: 'space-around',
      minHeight: getDesignRelativeHeight(200),
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
      lineHeight: getDesignRelativeHeight(19),
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
    privacyAndTerms: {
      marginBottom: getDesignRelativeHeight(16),
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
  }
}

const loginScreen = withStyles(getStylesFromProps)(SimpleStore.withStore(SigninScreen))

loginScreen.navigationOptions = {
  title: 'Login',
  navigationBarHidden: false,
}

export default loginScreen
