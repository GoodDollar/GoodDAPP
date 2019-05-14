// @flow
import React from 'react'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { StyleSheet, View, ScrollView } from 'react-native'
import { Text } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../lib/logger/pino-logger'
import { CustomButton } from '../common'
import { Description, LinkButton } from '../signup/components'
import { fontStyle } from '../common/styles'
import { TermsOfUse, PrivacyPolicy } from '../webView/webViewInstances'

type Props = {
  // callback to report to parent component
  navigation: any,
  screenProps: {
    push: Function
  }
}

const log = logger.child({ from: 'Auth' })

class Auth extends React.Component<Props> {
  static navigationOptions = {
    navigationBarHidden: true
  }

  handleSignUp = () => {
    this.props.navigation.navigate('Signup')
    //Hack to get keyboard up on mobile need focus from user event such as click
    setTimeout(() => {
      const el = document.getElementById('Name_input')
      if (el) el.focus()
    }, 500)
  }

  handleSignUpThirdParty = () => {
    // TODO: implement 3rd party sign up
    log.warn('3rd Party login not available yet')
  }

  handleSignIn = () => {
    this.props.navigation.navigate('SignIn')
  }

  handleNavigateTermsOfUse = () => this.props.screenProps.push('TermsOfUse')
  handleNavigatePrivacyPolicy = () => this.props.screenProps.push('PrivacyPolicy')

  render() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.topContainer}>
          <Description style={styles.paragraph}>
            {
              "Early Access Alpha's tokens will be revoked at the end of the test and they have no value until public release"
            }
          </Description>
        </View>
        <View style={styles.bottomContainer}>
          <Text style={styles.acceptTermsText}>
            {`By clicking the 'Create a wallet' button, you are accepting our `}
            <LinkButton style={styles.acceptTermsLink} onPress={this.handleNavigateTermsOfUse}>
              Terms of Service
            </LinkButton>
            {` and `}
            <LinkButton style={styles.acceptTermsLink} onPress={this.handleNavigatePrivacyPolicy}>
              Privacy Policy
            </LinkButton>
          </Text>
          <CustomButton style={styles.buttonLayout} mode="contained" onPress={this.handleSignUp}>
            Create a wallet
          </CustomButton>
          <Text style={styles.signInLink} onPress={this.handleSignIn}>
            Already have a wallet?
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    paddingLeft: '4%',
    paddingRight: '4%',
    display: 'flex',
    flex: 1
  },
  topContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  bottomContainer: {
    marginBottom: 30,
    paddingTop: 30
  },
  paragraph: {
    ...fontStyle,
    marginLeft: normalize(20),
    marginRight: normalize(20),
    fontSize: normalize(20),
    lineHeight: '1.2em'
  },
  buttonLayout: {
    padding: normalize(5),
    marginTop: normalize(20),
    marginBottom: normalize(20)
  },
  signInLink: {
    ...fontStyle,
    textDecorationLine: 'underline',
    fontSize: normalize(16)
  },
  acceptTermsText: {
    ...fontStyle,
    fontSize: normalize(14)
  },
  acceptTermsLink: {
    ...fontStyle,
    fontSize: normalize(14),
    fontWeight: 'bold'
  }
})

export default createStackNavigator(
  {
    Auth,
    TermsOfUse,
    PrivacyPolicy
  },
  {
    backRouteName: 'Auth'
  }
)
