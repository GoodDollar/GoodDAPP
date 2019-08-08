// @flow
import React from 'react'
import { Image, View } from 'react-native'
import Mnemonics from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import CustomButton from '../common/buttons/CustomButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { PrivacyPolicy, TermsOfUse } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import normalize from '../../lib/utils/normalizeText'
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
    this.props.navigation.navigate('Recover')
  }

  handleNavigateTermsOfUse = () => this.props.screenProps.push('TermsOfUse')

  handleNavigatePrivacyPolicy = () => this.props.screenProps.push('PrivacyPolicy')

  render() {
    const { styles } = this.props
    return (
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <Section justifyContent="space-between" style={styles.mainSection} alignItems="center">
          <Section.Row alignItems="center" justifyContent="center" style={styles.topRow}>
            <Section.Text color="surface" fontFamily="slab" fontSize={22} fontWeight={700}>
              {`Alpha tokens are \n for test use only!`}
            </Section.Text>
          </Section.Row>
          <Section.Separator color="#fff" width={2} style={styles.separator} />
          <Section.Row alignItems="center" justifyContent="center" style={styles.bottomRow}>
            <Section.Text color="surface" fontWeight="500" fontSize={16}>
              {`They have NO real value. \n And will be deleted at the end of the Alpha`}
            </Section.Text>
          </Section.Row>
        </Section>
        <Section>
          <Image source={illustration} style={styles.illustration} resizeMode="contain" />
        </Section>
        <View style={styles.bottomContainer}>
          <Text fontSize={12} color="gray80Percent">
            {`By clicking the 'Create a wallet' button,\n you are accepting our\n`}
            <Text style={styles.acceptTermsLink} onPress={this.handleNavigateTermsOfUse}>
              Terms of Use
            </Text>
            {` and `}
            <Text style={styles.acceptTermsLink} onPress={this.handleNavigatePrivacyPolicy}>
              Privacy Policy
            </Text>
          </Text>
          <CustomButton style={styles.buttonLayout} onPress={this.handleSignUp}>
            Create a wallet
          </CustomButton>
          <Text fontWeight="500" fontSize={14} color="primary" onPress={this.handleSignIn}>
            {`Already have a wallet? `}
            <Text fontWeight="500" fontSize={14} color="primary" onPress={this.handleSignIn} style={styles.underlined}>
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
      marginHorizontal: theme.sizes.defaultDouble,
      marginVertical: 'auto',
      borderRadius: 0,
      paddingHorizontal: theme.sizes.default,
      paddingVertical: theme.sizes.default,
      backgroundColor: theme.colors.darkGray,
      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.24)',
      marginBottom: 12,
    },
    separator: {
      maxWidth: 276,
    },
    topRow: {
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
      color: theme.colors.gray80Percent,
      fontFamily: theme.fonts.default,
      fontSize: normalize(12),
      fontWeight: '700',
      marginTop: theme.sizes.default,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
    underlined: {
      textDecorationLine: 'underline',
    },
    illustration: {
      flexGrow: 0,
      flexShrink: 0,
      marginBottom: theme.sizes.default,
      maxWidth: '100%',
      minHeight: 192,
      minWidth: 284,
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
  },
  {
    backRouteName: 'Auth',
  }
)
