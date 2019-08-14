// @flow
import React from 'react'
import { View } from 'react-native'
import Mnemonics from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import CustomButton from '../common/buttons/CustomButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
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
    const { styles } = this.props
    return (
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <Section justifyContent="space-between" style={styles.mainSection}>
          <Wrapper style={styles.containerPadding}>
            <Section.Row alignItems="center" justifyContent="center" style={styles.topRow}>
              <Section.Text color="surface" fontFamily="slab" fontSize={22} fontWeight="700">
                {`Alpha tokens are\nfor test use only!`}
              </Section.Text>
            </Section.Row>
            <Section.Row alignItems="center" justifyContent="center" style={styles.bottomRow}>
              <Section.Text color="surface" fontWeight="500" fontSize={16}>
                {`They have no real value and will be\ndeleted at the end of the Alpha`}
              </Section.Text>
            </Section.Row>
          </Wrapper>
        </Section>
        <View style={styles.bottomContainer}>
          <Text fontSize={12} color="gray80Percent">
            {`By clicking the 'Create a wallet' button,\nyou are accepting our\n`}
            <Text
              fontSize={12}
              color="gray80Percent"
              fontWeight="700"
              textDecorationLine="underline"
              onPress={this.handleNavigateTermsOfUse}
            >
              Terms of Use
            </Text>
            {' and '}
            <Text
              fontSize={12}
              color="gray80Percent"
              fontWeight="700"
              textDecorationLine="underline"
              onPress={this.handleNavigatePrivacyPolicy}
            >
              Privacy Policy
            </Text>
          </Text>
          <CustomButton style={styles.buttonLayout} onPress={this.handleSignUp}>
            Create a wallet
          </CustomButton>
          <Text fontSize={14} color="primary" onPress={this.handleSignIn}>
            {`Already have a wallet? `}
            <Text fontSize={14} color="primary" textDecorationLine="underline" onPress={this.handleSignIn}>
              Login
            </Text>
          </Text>
        </View>
      </Wrapper>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainWrapper: {
      paddingHorizontal: 0,
    },
    mainSection: {
      marginHorizontal: -theme.sizes.defaultDouble,
      marginVertical: 'auto',
      paddingHorizontal: 0,
    },
    containerPadding: {
      padding: 28,
      alignItems: 'center',
    },
    topRow: {
      borderBottomColor: theme.colors.surface,
      borderBottomWidth: 1,
      paddingBottom: theme.sizes.defaultDouble,
      maxWidth: 276,
    },
    bottomRow: {
      paddingTop: theme.sizes.defaultDouble,
    },
    bottomContainer: {
      padding: theme.sizes.defaultDouble,
    },
    buttonLayout: {
      marginVertical: 20,
    },
    acceptTermsLink: {
      marginTop: theme.sizes.default,
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
    Support,
  },
  {
    backRouteName: 'Auth',
  }
)
