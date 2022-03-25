// @flow
import React, { useContext, useEffect, useMemo } from 'react'
import { Platform, View } from 'react-native'

import { t, Trans } from '@lingui/macro'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import AuthProgressBar from '../components/AuthProgressBar'
import { withStyles } from '../../../lib/styles'
import { theme as mainTheme } from '../../theme/styles'

import Section from '../../common/layout/Section'
import CustomButton from '../../common/buttons/CustomButton'
import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  getMaxDeviceHeight,
  isLongDevice,
  isShortDevice,
} from '../../../lib/utils/sizes'
import Config from '../../../config/config'
import AuthStateWrapper from '../components/AuthStateWrapper'
import AuthContext from '../context/AuthContext'
import { fireEvent, GOTO_CHOOSEAUTH } from '../../../lib/analytics/analytics'
import LoginButton from '../components/LoginButton'

const SignupText = ({ screenProps }) => {
  const { push } = screenProps

  const [handleNavigateTermsOfUse, handleNavigatePrivacyPolicy] = useMemo(
    () => ['TermsOfUse', 'PrivacyPolicy'].map(screen => () => push(screen)),
    [push],
  )

  return (
    <>
      <Trans>
        <Text fontSize={12} color="gray80Percent">
          By signing up and entering, you are accepting our{'\n '}
          <Text
            fontSize={12}
            color="gray80Percent"
            fontWeight="bold"
            textDecorationLine="underline"
            onPress={handleNavigateTermsOfUse}
          >
            Terms of Use
          </Text>
          and
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
      </Trans>
    </>
  )
}

const SignupScreen = ({ screenProps, styles, handleLoginMethod, sdkInitialized, goBack }) => {
  const { success: signupSuccess, activeStep } = useContext(AuthContext)

  const [_selfCustodySignup, _selfCustodyLogin] = useMemo(
    () => ['selfCustody', 'selfCustodyLogin'].map(method => () => handleLoginMethod(method)),
    [handleLoginMethod],
  )

  useEffect(() => {
    fireEvent(GOTO_CHOOSEAUTH)
  }, [])

  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <NavBar logo />
      <AuthStateWrapper>
        <AuthProgressBar step={activeStep} done={signupSuccess} />
        <Section.Stack style={{ flex: 1, justifyContent: 'center' }}>
          <Section.Stack style={styles.contentWrapper}>
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
                {t`Choose Authentication Method`}
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
                {t`Start Claiming G$ Daily`}
              </Text>
              <Text
                color={'darkIndigo'}
                fontSize={getDesignRelativeHeight(18)}
                lineHeight={getDesignRelativeHeight(23)}
                letterSpacing={0.26}
                fontFamily="Roboto"
                style={{ marginTop: getDesignRelativeHeight(5) }}
              >
                <Trans>
                  Begin receiving real crypto, totally for\n free, and without having to risk any\n money to start.
                </Trans>
              </Text>
            </Section.Stack>
            <Section.Stack style={styles.bottomContainer}>
              <View style={{ width: '100%' }}>
                <LoginButton.Google handleLoginMethod={handleLoginMethod} disabled={!sdkInitialized} />
                <LoginButton.Facebook handleLoginMethod={handleLoginMethod} disabled={!sdkInitialized} />
                <LoginButton.Passwordless handleLoginMethod={handleLoginMethod} disabled={!sdkInitialized} />
              </View>
              <Section.Stack style={styles.textButtonContainer}>
                {Config.enableSelfCustody && (
                  <View>
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
                      onPress={_selfCustodySignup}
                      style={styles.textButton}
                    >
                      {t`Self Custody SignUp`}
                    </CustomButton>
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
                      onPress={_selfCustodyLogin}
                      style={styles.textButton}
                    >
                      {t`Self Custody Login`}
                    </CustomButton>
                  </View>
                )}
              </Section.Stack>
              <SignupText screenProps={screenProps} />
            </Section.Stack>
          </Section.Stack>
        </Section.Stack>
      </AuthStateWrapper>
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
    contentWrapper: {
      flex: 1,
      paddingBottom: getDesignRelativeHeight(isShortDevice ? 35 : 45),
      paddingTop: getDesignRelativeHeight(isShortDevice ? 35 : 45),
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
