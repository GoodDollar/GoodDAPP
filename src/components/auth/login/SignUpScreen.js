// @flow
import React, { useCallback } from 'react'
import { Platform, View } from 'react-native'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import { withStyles } from '../../../lib/styles'
import { theme as mainTheme } from '../../theme/styles'
import SignupIllu from '../../../assets/Signup/signup.svg'
import SigninIllu from '../../../assets/Auth/Illustrations_woman_love.svg'

import Section from '../../common/layout/Section'
import CustomButton from '../../common/buttons/CustomButton'
import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  getMaxDeviceHeight,
  isLongDevice,
} from '../../../lib/utils/sizes'
import googleBtnIcon from '../../../assets/Auth/btn_google.svg'
import facebookBtnIcon from '../../../assets/Auth/btn_facebook.svg'
import MobileBtnIcon from '../../../assets/Auth/btn_mobile.svg'
import Config from '../../../config/config'
import { LoginButton } from './LoginButton'

// import { delay } from '../../../lib/utils/async'

// import SpinnerCheckMark from '../../common/animations/SpinnerCheckMark'

const SignupScreen = ({ isSignup, screenProps, styles, handleLoginMethod, sdkInitialized, goBack }) => {
  const { push } = screenProps
  const handleNavigateTermsOfUse = useCallback(() => push('PrivacyPolicyAndTerms'), [push])

  const handleNavigatePrivacyPolicy = useCallback(() => push('PrivacyPolicy'), [push])

  const _google = () => handleLoginMethod('google')

  const _facebook = () => handleLoginMethod('facebook')

  const _mobile = () => handleLoginMethod('auth0-pwdless-sms')

  const _selfCustody = () => handleLoginMethod('selfCustody')

  const Illustration = isSignup ? SignupIllu : SigninIllu

  const buttonPrefix = isSignup ? 'Agree & Sign up' : 'Log in'

  const SigninText = () => (
    <>
      <Text fontSize={12} color="gray80Percent" style={styles.marginBottom}>
        {`Remember to login with the `}
        <Text fontSize={12} color="gray80Percent" fontWeight="bold">
          {`same login method\n`}
        </Text>
        that you’ve signed up with
      </Text>
    </>
  )

  const SignupText = () => (
    <>
      <Text fontSize={10} color="gray80Percent" style={styles.marginBottom}>
        {`By Signing up you are accepting our `}
        <Text
          fontSize={10}
          color="gray80Percent"
          fontWeight="bold"
          textDecorationLine="underline"
          onPress={handleNavigateTermsOfUse}
        >
          {`Terms of Use`}
        </Text>
        {' and '}
        <Text
          fontSize={10}
          color="gray80Percent"
          fontWeight="bold"
          textDecorationLine="underline"
          onPress={handleNavigatePrivacyPolicy}
        >
          Privacy Policy
        </Text>
      </Text>
    </>
  )
  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <NavBar title={isSignup ? 'Signup' : 'Login'} />
      <Section.Stack style={{ flex: 1, justifyContent: 'center' }}>
        <Section.Stack style={{ flex: 1, maxHeight: 640 }}>
          <Section.Stack style={{ flexGrow: 0 }}>
            <Text
              style={styles.headerText}
              fontSize={26}
              lineHeight={34}
              letterSpacing={0.26}
              fontFamily="Roboto"
              fontWeight="bold"
            >
              {isSignup ? `Welcome To GoodDollar!\nCreate a Wallet` : 'Welcome Back!'}
            </Text>
          </Section.Stack>
          <Section.Stack style={styles.illustration}>
            <Illustration width={'100%'} height={'100%'} viewBox={isSignup ? `0 0 255 170` : `0 0 206.391 173.887`} />
          </Section.Stack>
          <Section.Stack style={styles.bottomContainer}>
            {isSignup ? <SignupText /> : <SigninText />}
            <View style={{ width: '100%' }}>
              <LoginButton
                style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.googleBlue }]}
                onPress={_google}
                disabled={!sdkInitialized}
                testID="login_with_google"
                icon={googleBtnIcon}
              >
                {`${buttonPrefix} with Google`}
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
                iconProps={{ viewBox: '0 0 11 22' }}
              >
                {`${buttonPrefix} with Facebook`}
              </LoginButton>

              <LoginButton
                style={[
                  styles.buttonLayout,
                  styles.buttonsMargin,
                  {
                    backgroundColor: mainTheme.colors.darkBlue,
                  },
                ]}
                onPress={_mobile}
                disabled={!sdkInitialized}
                testID="login_with_auth0"
                icon={MobileBtnIcon}
                iconProps={{ viewBox: '0 0 14.001 26' }}
              >
                {`${buttonPrefix}${isSignup ? '' : ' with'} Passwordless`}
              </LoginButton>
            </View>
            <Section.Stack style={styles.textButtonContainer}>
              <CustomButton
                compact
                mode={'text'}
                color={mainTheme.colors.darkGray}
                textStyle={{
                  textDecorationLine: 'underline',
                  fontSize: 14,
                  fontWeight: 'bold',
                  lineHeight: 16,
                  letterSpacing: 0.14,
                }}
                onPress={goBack}
                style={styles.textButton}
              >
                {isSignup ? `Already Have a Wallet? Log In >` : `Dont Have a Wallet? Create One >`}
              </CustomButton>
              {Config.enableSelfCustody && (
                <CustomButton
                  compact
                  mode={'text'}
                  color={mainTheme.colors.darkGray}
                  textStyle={{
                    textDecorationLine: 'underline',
                    fontSize: 14,
                    fontWeight: 'bold',
                    lineHeight: 16,
                    letterSpacing: 0.14,
                  }}
                  onPress={_selfCustody}
                  style={styles.textButton}
                >
                  {isSignup ? `Self Custody >` : `Recover from seed phrase >`}
                </CustomButton>
              )}
            </Section.Stack>
          </Section.Stack>
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
      marginTop: getDesignRelativeHeight(theme.sizes.default * 3),
      maxWidth: 384,
      width: '100%',
      alignSelf: 'center',
    },
    buttonLayout: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 50,
      padding: 3,
    },
    illustration: {
      marginTop: getDesignRelativeHeight(theme.sizes.default * 3),
      height: getDesignRelativeHeight(170, false),
      width: getDesignRelativeWidth(255, false),
      justifyContent: 'center',
      alignSelf: 'center',
      flex: Platform.select({ web: isLongDevice ? 1 : 'inherit', native: isLongDevice ? 1 : 0 }),
    },
    headerText: {
      marginTop: getDesignRelativeHeight(!shorterDevice ? 25 : 20),
    },
    marginBottom: {
      marginBottom: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.defaultDouble),
    },
    buttonsMargin: {
      marginTop: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.defaultDouble),
    },
    textButton: {
      height: 23,
      minHeight: 23,
      flexDirection: 'column',
    },
    textButtonContainer: {
      marginVertical: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.default * 3),
    },
  }
}

const signupScreen = withStyles(getStylesFromProps)(SignupScreen)

export default signupScreen
