// @flow
import React from 'react'
import { Image, View } from 'react-native'
import Mnemonics from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import CustomButton from '../common/buttons/CustomButton'
import { PushButton } from '../appNavigation/PushButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import illustration from '../../assets/Auth/Illustration.svg'
type Props = {
  navigation: any,
  screenProps: {
    push: Function,
  },
  styles: any,
}

Image.prefetch(illustration)
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
    this.props.navigation.navigate('SigninInfo')
  }

  handleNavigateTermsOfUse = () => this.props.screenProps.push('TermsOfUse')

  handleNavigatePrivacyPolicy = () => this.props.screenProps.push('PrivacyPolicy')

  render() {
    const { styles } = this.props
    return (
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <Section justifyContent="space-between" style={styles.mainSection} alignItems="center">
          <Section.Row alignItems="center" justifyContent="center" style={styles.topRow}>
            <Section.Text color="surface" fontFamily="slab" fontSize={22} fontWeight="bold">
              {`Alpha tokens are\nfor test use only!`}
            </Section.Text>
          </Section.Row>
          <Section.Separator color="#fff" width={2} style={styles.separator} />
          <Section.Row alignItems="center" justifyContent="center">
            <Section.Text color="surface" fontWeight="medium">
              {`They have no real value and will be deleted at the end of the Alpha`}
            </Section.Text>
          </Section.Row>
        </Section>
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
        <View style={styles.bottomContainer}>
          <Text fontSize={12} color="gray80Percent">
            {`By clicking the 'Create a wallet' button,\nyou are accepting our\n`}
            <Text
              fontSize={12}
              color="gray80Percent"
              fontWeight="bold"
              textDecorationLine="underline"
              onPress={this.handleNavigateTermsOfUse}
            >
              Terms of Use
            </Text>
            {' and '}
            <Text
              fontSize={12}
              color="gray80Percent"
              fontWeight="bold"
              textDecorationLine="underline"
              onPress={this.handleNavigatePrivacyPolicy}
            >
              Privacy Policy
            </Text>
          </Text>
          <CustomButton style={styles.buttonLayout} onPress={this.handleSignUp}>
            Create a wallet
          </CustomButton>
          <PushButton dark={false} mode="outlined" onPress={this.handleSignIn}>
            SIGN IN
          </PushButton>
        </View>
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
    mainSection: {
      marginHorizontal: theme.sizes.defaultDouble,
      borderRadius: 0,
      paddingLeft: theme.sizes.default,
      paddingRight: theme.sizes.default,
      paddingVertical: theme.sizes.default,
      backgroundColor: theme.colors.darkGray,
      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.24)',
      marginBottom: 12,
    },
    separator: {
      maxWidth: 276,
      width: '100%',
      marginVertical: theme.sizes.default,
    },
    topRow: {
      maxWidth: 276,
    },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
      paddingBottom: theme.sizes.defaultDouble,
    },
    buttonLayout: {
      marginVertical: 20,
    },
    acceptTermsLink: {
      marginTop: theme.sizes.default,
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginBottom: theme.sizes.default,
      maxWidth: '100%',
      minHeight: 100,
      maxHeight: 192,
      paddingTop: theme.sizes.default,
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
