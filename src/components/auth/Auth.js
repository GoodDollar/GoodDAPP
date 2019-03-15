// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Headline, Paragraph, Text } from 'react-native-paper'
import { normalize } from 'react-native-elements'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'

type Props = {
  // callback to report to parent component
  navigation: any
}

const log = logger.child({ from: 'Auth' })

class Auth extends React.Component<Props> {
  componentDidMount() {
    log.info(goodWallet)
  }

  handleSignUp = () => {
    const destinationPath = this.props.navigation.getParam('destinationPath')
    const param = destinationPath ? { destinationPath } : {}
    this.props.navigation.navigate('Signup', param)
  }

  handleSignUpThirdParty = () => {
    // TODO: implement 3rd party sign up
    log.warn('3rd Party login not available yet')
  }

  handleSignIn = () => {
    this.props.navigation.navigate('SignIn')
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <View styles={styles.topContainer}>
          <View style={styles.textContainer}>
            <Headline style={[styles.fontBase, styles.headline]}>CREATE YOUR WALLET</Headline>
            <Paragraph style={[styles.fontBase, styles.paragraph]}>
              START EARNING MONEY & USE IT FOR PAYMENTS!
            </Paragraph>
          </View>

          <View style={styles.buttonsContainer}>
            <Button style={[styles.buttonLayout, styles.signUpButton]} mode="contained" onPress={this.handleSignUp}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </Button>
            <Button style={styles.buttonLayout} mode="outlined" onPress={this.handleSignUpThirdParty}>
              <Text style={[styles.buttonText, { color: '#555555' }]}>SIGN UP WITH 3rd PARTY</Text>
            </Button>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.signInLink} onPress={this.handleSignIn}>
            Sign In (Recovery In your Wallet)
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
    justifyContent: 'space-between',
    display: 'flex',
    flex: 1,
    alignItems: 'center'
  },
  topContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  bottomContainer: {
    marginBottom: 50,
    paddingTop: 30
  },
  textContainer: {
    paddingTop: '50%',
    marginTop: -30
  },
  buttonsContainer: {
    marginTop: 30
  },
  fontBase: {
    fontFamily: 'Helvetica, "sans-serif"',
    color: '#555555',
    textAlign: 'center'
  },
  headline: {
    fontWeight: 'bold',
    fontSize: normalize(24)
  },
  paragraph: {
    fontSize: normalize(18),
    lineHeight: '1.2em'
  },
  buttonLayout: {
    marginTop: 30,
    padding: 10
  },
  buttonText: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'white',
    fontWeight: 'bold'
  },
  signUpButton: {
    backgroundColor: '#555555'
  },
  signInLink: {
    color: '#555555',
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(18),
    textDecorationLine: 'underline',
    textAlign: 'center'
  }
})

export default Auth
