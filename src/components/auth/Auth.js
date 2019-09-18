// @flow
import React from 'react'
import { AsyncStorage, Image } from 'react-native'
import _get from 'lodash/get'
import Mnemonics from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import CustomButton from '../common/buttons/CustomButton'
import { PushButton } from '../appNavigation/PushButton'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import illustration from '../../assets/Auth/Illustration.svg'
import NavBar from '../appNavigation/NavBar'
import config from '../../config/config'
import { theme as mainTheme } from '../theme/styles'
import API from '../../lib/API/api'
import Section from '../common/layout/Section'

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
  state = {
    asGuest: false,
  }

  async componentWillMount() {
    await this.checkWeb3TokenAndPaymentCode()
  }

  checkWeb3TokenAndPaymentCode = async () => {
    const { navigation } = this.props
    const web3Token = await AsyncStorage.getItem('web3Token')
    const _destinationPath = await AsyncStorage.getItem('destinationPath')
    const destinationPath = JSON.parse(_destinationPath)
    const paymentCode = _get(destinationPath, 'params.paymentCode')

    if (paymentCode) {
      return this.setState({
        asGuest: true,
      })
    }

    if (web3Token) {
      this.setState({
        asGuest: true,
      })

      let behaviour
      let w3User

      try {
        const w3userData = await API.getUserFromW3ByToken(web3Token)
        w3User = (w3userData && w3userData.data) || {}

        if (w3User.has_wallet) {
          behaviour = 'goToSignInScreen'
        }
      } catch (e) {
        behaviour = 'showTokenError'
      }

      switch (behaviour) {
        case 'showTokenError':
          navigation.navigate('InvalidW3TokenError')
          break

        case 'goToSignInScreen':
          navigation.navigate('SigninInfo')
          break

        default:
          break
      }
    }
  }

  handleSignUp = async () => {
    await AsyncStorage.removeItem('gun/').catch(e => log.error('Failed to clear localStorage', e.message, e))

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

  goToW3Site = () => {
    window.location = config.web3SiteUrl
  }

  render() {
    const { styles } = this.props
    const { asGuest } = this.state
    const firstButtonHandler = asGuest ? this.handleSignUp : this.goToW3Site
    const firstButtonText = asGuest ? 'Create a wallet' : 'Get Invited'
    const firstButtonColor = asGuest ? undefined : mainTheme.colors.orange
    const firstButtontextStyle = asGuest ? undefined : styles.textBlack

    return (
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <NavBar title={'Welcome'} />
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
        <Section style={styles.bottomContainer}>
          {asGuest && (
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
                r
                textDecorationLine="underline"
                onPress={this.handleNavigatePrivacyPolicy}
              >
                Privacy Policy
              </Text>
            </Text>
          )}
          <CustomButton
            color={firstButtonColor}
            style={styles.buttonLayout}
            textStyle={firstButtontextStyle}
            onPress={firstButtonHandler}
          >
            {firstButtonText}
          </CustomButton>
          <PushButton dark={false} mode="outlined" onPress={this.handleSignIn}>
            SIGN IN
          </PushButton>
        </Section>
      </Wrapper>
    )
  }
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'space-between',
      flexGrow: 1,
    },
    textBlack: {
      color: theme.fontStyle.color,
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
