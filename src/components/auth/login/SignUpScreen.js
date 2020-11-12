// @flow
import React, { useCallback, useState } from 'react'
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

  const _google = () => handleLoginMethod('google')

  const _facebook = () => handleLoginMethod('facebook')

  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <Section.Stack style={{ flex: 1 }}>
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
      </Section.Stack>
      <Section.Stack style={styles.illustration}>
        <AnimationsPeopleFlying />
      </Section.Stack>
      <Section.Stack style={styles.bottomContainer}>
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
              {`Agree & Sign up with Facebook`}
            </LoginButton>
          </React.Fragment>
        )}
        <Section.Stack style={styles.buttonsMargin}>
          <PasswordLess isOpen={isPasswordless} onSelect={handlePasswordless} handleLoginMethod={handleLoginMethod} />
        </Section.Stack>
      </Section.Stack>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  const shorterDevice = getMaxDeviceHeight() <= 622
  const illustrationSize = getDesignRelativeWidth(isBrowser ? 429 : shorterDevice ? 249 : 350)

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

      // maxHeight: getDesignRelativeHeight(225),
      // minHeight: getDesignRelativeHeight(256),
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
      marginTop: getDesignRelativeHeight(theme.sizes.default * 5),
      width: illustrationSize,
      height: getDesignRelativeHeight(192),
      paddingRight: getDesignRelativeWidth(15),
      flex: 1,
      justifyContent: 'center',
      alignSelf: 'center',
    },
    headerText: {
      marginTop: getDesignRelativeHeight(!shorterDevice ? 45 : 30),
    },
    marginBottom: {
      marginBottom: getDesignRelativeHeight(isBrowser ? theme.sizes.defaultDouble : theme.sizes.default),
    },
    buttonsMargin: {
      marginTop: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.defaultDouble),
    },
  }
}

const signupScreen = withStyles(getStylesFromProps)(SimpleStore.withStore(SignupScreen))

signupScreen.navigationOptions = {
  title: 'Signup',
  navigationBarHidden: false,
}

export default signupScreen
