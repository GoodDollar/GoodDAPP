// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { View } from 'react-native'
import Mnemonics from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import { CustomButton, Text } from '../common'
import { Description, LinkButton, Title } from '../signup/components'
import { PrivacyPolicy, TermsOfUse } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'

type Props = {
  navigation: any,
  screenProps: {
    push: Function,
  },
  styles: any,
}

const log = logger.child({ from: 'Auth' })
class Auth extends React.Component<Props> {
  handleSignUp = () => {
    this.props.navigation.navigate('Signup')

    //Hack to get keyboard up on mobile need focus from user event such as click
    setTimeout(() => {
      const el = document.getElementById('Name_input')
      if (el) {
        el.focus()
      }
    }, 500)
  }

  handleSignUpThirdParty = () => {
    // TODO: implement 3rd party sign up
    log.warn('3rd Party login not available yet')
  }

  handleSignIn = () => {
    this.props.navigation.navigate('Recover')
  }

  handleNavigateTermsOfUse = () => this.props.screenProps.push('TermsOfUse')

  handleNavigatePrivacyPolicy = () => this.props.screenProps.push('PrivacyPolicy')

  render() {
    const { styles, ...rest } = this.props
    const {
      acceptTermsLink,
      acceptTermsText,
      bottomContainer,
      buttonLayout,
      paragraph,
      signInLink,
      title,
      topContainer,
      wrapper,
    } = styles
    return (
      <View style={wrapper} {...rest}>
        <View style={topContainer}>
          <Title style={title}>Just a heads up!</Title>
          <Description style={paragraph}>
            {`All tokens in the Alpha are "test tokens".\nThey have NO real value.\nThey will be deleted at the end of the Alpha.`}
          </Description>
        </View>
        <View style={bottomContainer}>
          <Text style={acceptTermsText}>
            {`By clicking the 'Create a wallet' button, you are accepting our `}
            <LinkButton style={acceptTermsLink} onPress={this.handleNavigateTermsOfUse}>
              Terms of Service
            </LinkButton>
            {` and `}
            <LinkButton style={acceptTermsLink} onPress={this.handleNavigatePrivacyPolicy}>
              Privacy Policy
            </LinkButton>
          </Text>
          <CustomButton style={buttonLayout} mode="contained" onPress={this.handleSignUp}>
            Create a wallet
          </CustomButton>
          <Text style={signInLink} onPress={this.handleSignIn}>
            Already have a wallet?
          </Text>
        </View>
      </View>
    )
  }
}
const getStylesFromProps = ({ theme }) => {
  return {
    wrapper: {
      backgroundColor: '#fff',
      display: 'flex',
      flex: 1,
      height: '100%',
      paddingLeft: '4%',
      paddingRight: '4%',
    },
    topContainer: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
    },
    bottomContainer: {
      marginBottom: 30,
      paddingTop: 30,
    },
    title: {
      marginBottom: 0,
    },
    paragraph: {
      ...theme.fontStyle,
      marginLeft: 0,
      marginRight: 0,
      fontSize: normalize(16),
      lineHeight: '1.3em',
      fontWeight: '500',
    },
    buttonLayout: {
      padding: normalize(5),
      marginTop: normalize(20),
      marginBottom: normalize(20),
    },
    signInLink: {
      ...theme.fontStyle,
      textDecorationLine: 'underline',
      fontSize: normalize(16),
    },
    acceptTermsText: {
      ...theme.fontStyle,
      fontSize: normalize(12),
    },
    acceptTermsLink: {
      ...theme.fontStyle,
      fontSize: normalize(12),
      fontWeight: 'bold',
    },
  }
}
const auth = withStyles(getStylesFromProps)(Auth)
auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true,
}
export default createStackNavigator(
  {
    Login: auth,
    TermsOfUse,
    PrivacyPolicy,
    Recover: Mnemonics,
  },
  {
    backRouteName: 'Auth',
  }
)
