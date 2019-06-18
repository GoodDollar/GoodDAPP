// @flow
import React from 'react'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { StyleSheet, View, ScrollView } from 'react-native'
import { Text } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../lib/logger/pino-logger'
import { CustomButton } from '../common'
import { Description, LinkButton, Title } from '../signup/components'
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
          <Title style={styles.title}>Just a heads up!</Title>
          <Description style={styles.paragraph}>
            {`All tokens in the Alpha are "test tokens".\nThey have NO real value.\nThey will be deleted at the end of the Alpha.`}
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

Auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true
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
    justifyContent: 'center'
  },
  bottomContainer: {
    marginBottom: 30,
    paddingTop: 30
  },
  title: {
    marginBottom: 0
  },
  paragraph: {
    ...fontStyle,
    marginLeft: 0,
    marginRight: 0,
    fontSize: normalize(16),
    lineHeight: '1.3em',
    fontWeight: '500'
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
    fontSize: normalize(12)
  },
  acceptTermsLink: {
    ...fontStyle,
    fontSize: normalize(12),
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
