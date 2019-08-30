// @flow
import React from 'react'
import { Image, View } from 'react-native'

// import Mnemonics from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import Section from '../common/layout/Section'
import Circle from '../common/view/Circle'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'

// import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
// import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import illustration from '../../assets/Signin/illustration.svg'
import normalize from '../../lib/utils/normalizeText'
type Props = {
  navigation: any,
  screenProps: {
    push: Function,
  },
  styles: any,
}

Image.prefetch(illustration)
const log = logger.child({ from: 'Auth' })

class SignInState extends React.Component<Props> {
  handleSignUpThirdParty = () => {
    // TODO: implement 3rd party sign up
    log.warn('3rd Party login not available yet')
  }

  handleSignIn = () => {
    this.props.navigation.navigate('Signin')

    // this.props.navigation.navigate('Recover')
  }

  handleRecover = () => {
    this.props.navigation.navigate('Mnemonics')

    // this.props.navigation.navigate('Recover')
  }

  render() {
    const { styles } = this.props
    return (
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
        <Section.Stack grow justifyContent="flex-start">
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <View style={styles.bottomContainer}>
              <Text fontWeight="medium" fontSize={normalize(22)} fontFamily="roboto">
                {'To sign in\n please follow this steps:'}
              </Text>
              <Text fontSize={normalize(14)} color="gray80Percent" fontFamily="roboto">
                {`(works from any device or platform)`}
              </Text>
              <Section.Text>
                <Circle number={1}>Go to your email</Circle>
                <Circle number={2}>
                  Find{' '}
                  <Text fontWeight="bold" style={styles.text} fontFamily="Roboto">
                    GoodDollar magic mail
                  </Text>
                </Circle>
                <Circle number={3}>
                  Click the{' '}
                  <Text fontWeight="bold" style={styles.text} fontFamily="Roboto">
                    magic link
                  </Text>
                </Circle>
              </Section.Text>
            </View>
          </Section.Row>
        </Section.Stack>
        <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
          <Section.Text
            fontWeight="medium"
            style={styles.textBottom}
            textDecorationLine="underline"
            fontSize={normalize(14)}
            color="primary"
            onPress={this.handleRecover}
          >
            Or, recover from pass phrase
          </Section.Text>
        </Section.Row>
      </Wrapper>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainWrapper: {
      paddingHorizontal: 0,
      justifyContent: 'space-evenly',
    },

    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginTop: 30,
      marginBottom: 30,
      maxWidth: '100%',
      maxHeight: 175,
      minHeight: 95,
      paddingTop: theme.sizes.default,
    },
    textTop: {
      fontFamily: 'Roboto-Medium',
    },
    text: {
      color: theme.colors.green,
    },
    textBottom: {
      marginBottom: 24,
    },
  }
}

SignInState.navigationOptions = {
  title: 'Sign in',
  navigationBarHidden: false,
}

export default withStyles(getStylesFromProps)(SignInState)

// const auth = withStyles(getStylesFromProps)(SignInState)
// auth.navigationOptions = {
//   title: 'Sign In',
//   navigationBarHidden: true,
// }
// export default createStackNavigator(
//   {
//     Login: auth,
//     TermsOfUse,
//     PrivacyPolicy,
//     Recover: Mnemonics,
//     Support,
//   },
//   {
//     backRouteName: 'Auth',
//   }
// )
