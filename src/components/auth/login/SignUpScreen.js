// @flow
import React, { useCallback, useRef } from 'react'
import { Platform, View } from 'react-native'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import AuthProgressBar from '../AuthProgressBar'
import { withStyles } from '../../../lib/styles'
import { theme as mainTheme } from '../../theme/styles'

import Section from '../../common/layout/Section'
import CustomButton from '../../common/buttons/CustomButton'
import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  getMaxDeviceHeight,
  isLongDevice,
} from '../../../lib/utils/sizes'
import googleBtnIcon from '../../../assets/Auth/btn-google.svg'
import facebookBtnIcon from '../../../assets/Auth/btn-facebook.svg'
import Config from '../../../config/config'
import logger from '../../../lib/logger/js-logger'
import { LoginButton } from './LoginButton'
import Recaptcha from './Recaptcha'

const log = logger.child({ from: 'SignUpScreen' })

const SignupScreen = ({ screenProps, styles, handleLoginMethod, sdkInitialized, goBack }) => {
  const { push } = screenProps

  const handleNavigateTermsOfUse = useCallback(() => push('PrivacyPolicyAndTerms'), [push])

  const handleNavigatePrivacyPolicy = useCallback(() => push('PrivacyPolicy'), [push])

  const reCaptchaRef = useRef()

  const _google = () => handleLoginMethod('google')

  const _facebook = () => handleLoginMethod('facebook')

  const _mobile = () => {
    const { current: captcha } = reCaptchaRef

    if (!captcha) {
      return
    }

    // If recaptcha has already been passed successfully, trigger torus right away
    if (captcha.hasPassedCheck()) {
      onRecaptchaSuccess()
      return
    }

    captcha.launchCheck()
  }

  const onRecaptchaSuccess = useCallback(() => {
    log.debug('Recaptcha successfull')
    handleLoginMethod('auth0-pwdless-sms')
  }, [handleLoginMethod])

  const onRecaptchaFailed = useCallback(() => {
    log.debug('Recaptcha failed')
  }, [])

  const _selfCustody = () => handleLoginMethod('selfCustody')

  const buttonPrefix = 'Continue with'

  const SignupText = () => (
    <>
      <Text fontSize={12} color="gray80Percent">
        {`By signing up and entering, you are accepting\nour`}
        <Text
          fontSize={12}
          color="gray80Percent"
          fontWeight="bold"
          textDecorationLine="underline"
          onPress={handleNavigateTermsOfUse}
        >
          {`Terms of Use`}
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
    </>
  )

  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <NavBar logo />
      <AuthProgressBar step={1} />
      <Section.Stack style={{ flex: 1, justifyContent: 'center' }}>
        <Section.Stack style={{ flex: 1, maxHeight: 640 }}>
          <Section.Stack style={{ flexGrow: 0 }}>
            <Text
              color={'primary'}
              fontSize={getDesignRelativeHeight(12)}
              lineHeight={getDesignRelativeHeight(21)}
              letterSpacing={0.26}
              fontFamily="Roboto"
              fontWeight="bold"
              textTransform="uppercase"
            >
              Choose Authentication Method
            </Text>
            <Text
              color={'darkIndigo'}
              fontSize={getDesignRelativeHeight(26)}
              lineHeight={getDesignRelativeHeight(34)}
              letterSpacing={0.26}
              fontFamily="Roboto"
              fontWeight="bold"
              style={{ marginTop: getDesignRelativeHeight(15) }}
            >
              Simply Claim G$ Daily
            </Text>
            <Text
              color={'darkIndigo'}
              fontSize={getDesignRelativeHeight(18)}
              lineHeight={getDesignRelativeHeight(23)}
              letterSpacing={0.26}
              fontFamily="Roboto"
              style={{ marginTop: getDesignRelativeHeight(5) }}
            >
              {`Your security is important to us, so we\n need to verify you’re a real person.\n Continuing using Facebook or Google\n would make that easier.`}
            </Text>
          </Section.Stack>
          <Section.Stack style={styles.bottomContainer}>
            <View style={{ width: '100%' }}>
              <LoginButton
                style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.googleRed }]}
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

              <Recaptcha ref={reCaptchaRef} onSuccess={onRecaptchaSuccess} onFailure={onRecaptchaFailed}>
                <LoginButton
                  style={[
                    styles.buttonLayout,
                    styles.buttonsMargin,
                    {
                      backgroundColor: mainTheme.colors.white,
                      borderWidth: 1,
                      borderColor: '#E9ECFF',
                    },
                  ]}
                  onPress={_mobile}
                  disabled={!sdkInitialized}
                  textColor="#8499BB"
                  testID="login_with_auth0"
                >
                  {`${buttonPrefix} Passwordless`}
                </LoginButton>
              </Recaptcha>
            </View>
            <Section.Stack style={styles.textButtonContainer}>
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
                  Self Custody
                </CustomButton>
              )}
            </Section.Stack>
            <SignupText />
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
      justifyContent: 'flex-end',
      paddingHorizontal: theme.sizes.defaultDouble,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 3),
      maxWidth: 384,
      width: '100%',
      alignSelf: 'center',
    },
    buttonLayout: {
      justifyContent: 'center',
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
