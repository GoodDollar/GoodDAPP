// @flow
import React from 'react'
import { Platform, SafeAreaView } from 'react-native'
import { t, Trans } from '@lingui/macro'
import Recover from '../signin/Mnemonics'
import { fireEvent, SIGNUP_METHOD_SELECTED } from '../../lib/analytics/analytics'
import CustomButton from '../common/buttons/CustomButton'
import AnimationsPeopleFlying from '../common/animations/PeopleFlying'
import { PushButton } from '../appNavigation/PushButton'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import Section from '../common/layout/Section'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../../lib/constants/login'

type Props = {
  navigation: any,
  screenProps: {
    push: Function,
  },
  styles: any,
}

const Auth = (props: Props) => {
  const handleSignUp = () => {
    fireEvent(SIGNUP_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })

    props.navigation.navigate('Signup', { regMethod: REGISTRATION_METHOD_SELF_CUSTODY })

    if (Platform.OS === 'web') {
      // Hack to get keyboard up on mobile need focus from user event such as click
      setTimeout(() => {
        const el = document.getElementById('Name_input')
        if (el) {
          el.focus()
        }
      }, 500)
    }
  }

  /*  const handleSignUpThirdParty = () => {
    // TODO: implement 3rd party sign up
    log.warn('3rd Party login not available yet')
  }
*/

  const handleSignIn = () => {
    props.navigation.navigate('SigninInfo')
  }

  const handleNavigateTermsOfUse = () => props.screenProps.push('TermsOfUse')

  const handleNavigatePrivacyPolicy = () => props.screenProps.push('PrivacyPolicy')

  const { styles } = props
  const firstButtonHandler = handleSignUp
  const firstButtonText = t`Create a wallet`

  return (
    <SafeAreaView style={styles.mainWrapper}>
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <Text
          testID="welcomeLabel"
          style={styles.headerText}
          fontSize={22}
          lineHeight={25}
          fontFamily="Roboto"
          fontWeight="medium"
        >
          {t`Welcome to
          GoodDollar Wallet`}
        </Text>
        <AnimationsPeopleFlying />
        <Section style={styles.bottomContainer}>
          <Trans>
            <Text fontSize={12} color="gray80Percent">
              {`By clicking the 'Create a wallet' button,\nyou are accepting our\n`}
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
          </Trans>

          <CustomButton style={styles.buttonLayout} onPress={firstButtonHandler} testID="firstButton">
            {firstButtonText}
          </CustomButton>

          <PushButton testID="signInButton" dark={false} mode="outlined" onPress={handleSignIn}>
            <Trans>
              <Text style={styles.buttonText} fontWeight="regular" color={'primary'}>
                ALREADY REGISTERED?
                <Text textTransform={'uppercase'} style={styles.buttonText} color={'primary'} fontWeight="black">
                  {' SIGN IN'}
                </Text>
              </Text>
            </Trans>
          </PushButton>
        </Section>
      </Wrapper>
    </SafeAreaView>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainWrapper: {
      padding: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'space-between',
      flex: 1,
    },
    textBlack: {
      color: theme.fontStyle.color,
    },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
      paddingBottom: theme.sizes.defaultDouble,
    },
    buttonLayout: {
      marginTop: 20,
      marginBottom: 20,
    },
    buttonText: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1,
      letterSpacing: 0,
    },
    acceptTermsLink: {
      marginTop: theme.sizes.default,
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginBottom: theme.sizes.default,
      width: '100%',
      minHeight: 100,
      maxHeight: 192,
      paddingTop: theme.sizes.default,
    },
    headerText: {
      marginTop: getDesignRelativeHeight(95),
      marginBottom: getDesignRelativeHeight(25),
    },
  }
}

const auth = withStyles(getStylesFromProps)(Auth)
auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true,
}

const routes = {
  Login: auth,
  TermsOfUse,
  PrivacyPolicy,
  Support,
  Recover,
}

export default createStackNavigator(routes, { backRouteName: 'Welcome' })
