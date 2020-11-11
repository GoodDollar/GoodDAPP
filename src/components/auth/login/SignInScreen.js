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
import { PasswordLess } from '../torus/PasswordLess'
import { LoginButton } from './LoginButton'

//TODO: refactor to new svg
Image.prefetch(illustration)

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
      <Section.Stack style={{ flex: 'auto' }}>
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
      </Section.Stack>
      <Section.Stack>
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
      </Section.Stack>

      <Section.Stack style={styles.bottomContainer}>
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
              icon={googleBtnIcon}
            >
              Log in with Google
            </LoginButton>
            <LoginButton
              style={[
                styles.buttonLayout,
                styles.buttonsMargin,
                {
                  backgroundColor: mainTheme.colors.facebookBlue,
                },
              ]}
              onPress={_facebook}
              disabled={!sdkInitialized}
              testID="login_with_facebook"
              icon={facebookBtnIcon}
            >
              Log in with Facebook
            </LoginButton>
          </>
        )}
        <Section.Stack style={styles.buttonsMargin}>
          <PasswordLess
            isSignup={false}
            isOpen={isPasswordless}
            onSelect={handlePasswordless}
            handleLoginMethod={handleLoginMethod}
          />
        </Section.Stack>
      </Section.Stack>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  const shorterDevice = getMaxDeviceHeight() <= 622

  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      flexGrow: 1,
    },
    bottomContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: theme.sizes.defaultDouble,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 5),
    },
    buttonLayout: {
      flex: 1,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 50,
      padding: 3,
    },
    illustration: {
      flex: 1,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 5),
      width: getDesignRelativeWidth(isBrowser ? 290 : 206, false),
      height: getDesignRelativeHeight(172, false),
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerText: {
      marginTop: getDesignRelativeHeight(!shorterDevice ? 45 : 30),
    },
    privacyAndTerms: {
      marginBottom: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : theme.sizes.default),
    },
    buttonsMargin: {
      marginTop: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.defaultDouble),
    },
  }
}

const loginScreen = withStyles(getStylesFromProps)(SimpleStore.withStore(SigninScreen))

loginScreen.navigationOptions = {
  title: 'Login',
  navigationBarHidden: false,
}

export default loginScreen
