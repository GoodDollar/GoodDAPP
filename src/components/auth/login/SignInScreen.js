// @flow
import React, { useCallback, useState } from 'react'
import { Image } from 'react-native'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import { withStyles } from '../../../lib/styles'
import illustration from '../../../assets/Auth/Illustrations_woman_love.svg'
import googleBtnIcon from '../../../assets/Auth/btn_google.svg'
import facebookBtnIcon from '../../../assets/Auth/btn_facebook.svg'
import { isBrowser } from '../../../lib/utils/platform'
import { theme as mainTheme } from '../../theme/styles'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getDesignRelativeWidth, getMaxDeviceHeight } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import normalizeText from '../../../lib/utils/normalizeText'
import { PasswordLess } from '../torus/PasswordLess'
import { LoginButton } from './LoginButton'

//TODO: refactor to new svg
Image.prefetch(illustration)

const SigninScreen = ({ styles, store, handleLoginMethod, sdkInitialized, goBack }) => {
  const [isPasswordless, setPasswordless] = useState(false)

  const handlePasswordless = () => {
    setPasswordless(true)
  }

  const _goBack = useCallback(() => {
    if (isPasswordless) {
      return setPasswordless(false)
    }
    goBack()
  })

  const _google = useCallback(() => {
    handleLoginMethod('google')
  })
  const _facebook = useCallback(() => {
    handleLoginMethod('facebook')
  })

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
      <Image source={illustration} style={styles.illustration} resizeMode="contain" />
      <Section style={styles.bottomContainer}>
        <Text fontSize={12} color="gray80Percent" style={styles.privacyAndTerms}>
          {`Remember to login with the `}
          <Text fontSize={12} color="gray80Percent" fontWeight="bold">
            {`same login method\n`}
          </Text>
          that you’ve signed up with
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
              Log in with Google
            </LoginButton>
            <LoginButton
              style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.facebookBlue }]}
              onPress={_facebook}
              disabled={!sdkInitialized}
              testID="login_with_facebook"
              icon={facebookBtnIcon}
            >
              Log in with Facebook
            </LoginButton>
          </React.Fragment>
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
      width: getDesignRelativeWidth(isBrowser ? 290 : 206),
      height: getDesignRelativeHeight(172),
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingTop: getDesignRelativeHeight(theme.sizes.default),
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
