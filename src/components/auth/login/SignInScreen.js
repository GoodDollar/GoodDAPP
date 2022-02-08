// @flow
import React, { useCallback, useState } from 'react'
import { View } from 'react-native'
import { Trans } from '@lingui/macro'
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
      <Section.Stack style={{ flexGrow: 0 }}>
        <Text
          style={styles.headerText}
          fontSize={26}
          lineHeight={34}
          letterSpacing={0.26}
          fontFamily="Roboto"
          fontWeight="bold"
        >
          <Trans>Welcome Back!</Trans>
        </Text>
      </Section.Stack>
      <View style={styles.illustration}>
        <Illustration
          width={getDesignRelativeWidth(isBrowser ? 290 : 206)}
          height={getDesignRelativeHeight(172)}
          viewBox="0 0 206.391 173.887"
        />
      </View>

      <Section.Stack style={styles.bottomContainer}>
        <Trans>
          <Text fontSize={12} color="gray80Percent" style={styles.privacyAndTerms}>
            {`Remember to login with the `}
            <Text fontSize={12} color="gray80Percent" fontWeight="bold">
              {`same login method\n`}
            </Text>
            that you’ve signed up with
          </Text>
        </Trans>
        {isPasswordless === false && (
          <>
            <LoginButton
              style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.googleBlue }]}
              onPress={_google}
              disabled={!sdkInitialized}
              testID="login_with_google"
              icon={GoogleBtnIcon}
            >
              <Trans>Log in with Google</Trans>
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
              icon={FacebookBtnIcon}
              iconProps={{ viewBox: '0 0 11 22' }}
            >
              <Trans>Log in with Facebook</Trans>
            </LoginButton>
          </>
        )}
        <Section.Stack>
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
      flex: 1,
    },
    bottomContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: theme.sizes.defaultDouble,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 5),
    },
    buttonLayout: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
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
      marginBottom: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.defaultDouble),
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
