// @flow
import React from 'react'
import { AsyncStorage, Platform, SafeAreaView } from 'react-native'
import { get } from 'lodash'
import Mnemonics from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import { CLICK_BTN_GETINVITED, fireEvent } from '../../lib/analytics/analytics'
import CustomButton from '../common/buttons/CustomButton'
import AnimationsPeopleFlying from '../common/animations/PeopleFlying'
import { PushButton } from '../appNavigation/PushButton'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import config from '../../config/config'
import { theme as mainTheme } from '../theme/styles'
import API from '../../lib/API/api'
import Section from '../common/layout/Section'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import SimpleStore from '../../lib/undux/SimpleStore'

type Props = {
  navigation: any,
  screenProps: {
    push: Function,
  },
  styles: any,
}

const log = logger.child({ from: 'Auth' })

class Auth extends React.Component<Props> {
  state = {
    asGuest: config.isEToro !== true,
    withW3Token: false,
    w3User: undefined,
  }

  async componentWillMount() {
    await this.checkWeb3TokenAndPaymentCode()
  }

  checkWeb3TokenAndPaymentCode = async () => {
    const { navigation } = this.props
    const web3Token = await AsyncStorage.getItem('GD_web3Token')
    const _destinationPath = await AsyncStorage.getItem('GD_destinationPath')
    const destinationPath = JSON.parse(_destinationPath)
    const paymentCode = get(destinationPath, 'params.paymentCode')

    log.info('checkWeb3TokenAndPaymentCode', web3Token, paymentCode)

    if (paymentCode) {
      return this.setState({
        asGuest: true,
      })
    }

    if (web3Token) {
      this.setState({
        asGuest: true,
        withW3Token: true,
      })

      let behaviour
      let w3User

      try {
        const w3userData = await API.getUserFromW3ByToken(web3Token)
        w3User = (w3userData && w3userData.data) || {}

        if (w3User.has_wallet) {
          behaviour = 'goToSignInScreen'
        } else {
          this.setState({
            w3User,
            w3Token: web3Token,
          })
        }
      } catch (e) {
        behaviour = 'showTokenError'
      }

      log.info('behaviour', behaviour)

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
    const { store } = this.props
    store.set('loadingIndicator')({ loading: true })
    const { w3User, w3Token } = this.state
    const redirectTo = w3Token ? 'Phone' : 'Signup'
    log.debug({ w3User, w3Token })

    // FIXME: RN
    if (Platform.OS === 'web') {
      try {
        const req = new Promise((res, rej) => {
          const del = indexedDB.deleteDatabase('radata')
          del.onsuccess = res
          del.onerror = rej
        })
        await req

        log.info('indexedDb successfully cleared')
      } catch (e) {
        log.error('Failed to clear indexedDb', e.message, e)
      } finally {
        store.set('loadingIndicator')({ loading: false })
      }
    } else {
      store.set('loadingIndicator')({ loading: false })
    }

    this.props.navigation.navigate(redirectTo, { w3User, w3Token })

    if (Platform.OS === 'web') {
      //Hack to get keyboard up on mobile need focus from user event such as click
      setTimeout(() => {
        const el = document.getElementById('Name_input')
        if (el) {
          el.focus()
        }
      }, 500)
    }
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
    fireEvent(CLICK_BTN_GETINVITED)
    window.location = config.web3SiteUrl
  }

  render() {
    const { styles } = this.props
    const { asGuest, withW3Token } = this.state
    const firstButtonHandler = asGuest ? this.handleSignUp : this.goToW3Site
    const firstButtonText = asGuest ? (
      'Create a wallet'
    ) : (
      <Text style={styles.buttonText} fontWeight="medium">
        NEW HERE?
        <Text style={styles.buttonText} fontWeight="black">
          {' GET INVITED'}
        </Text>
      </Text>
    )

    const firstButtonColor = asGuest ? undefined : mainTheme.colors.orange
    const firstButtonTextStyle = asGuest ? undefined : styles.textBlack

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
            {'Welcome to\nGoodDollar Wallet'}
          </Text>
          <AnimationsPeopleFlying />
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
              textStyle={firstButtonTextStyle}
              onPress={firstButtonHandler}
              testID="firstButton"
            >
              {firstButtonText}
            </CustomButton>
            {!withW3Token && (
              <PushButton testID="signInButton" dark={false} mode="outlined" onPress={this.handleSignIn}>
                <Text style={styles.buttonText} fontWeight="regular" color={'primary'}>
                  ALREADY REGISTERED?
                  <Text textTransform={'uppercase'} style={styles.buttonText} color={'primary'} fontWeight="black">
                    {' SIGN IN'}
                  </Text>
                </Text>
              </PushButton>
            )}
          </Section>
        </Wrapper>
      </SafeAreaView>
    )
  }
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
      marginVertical: 20,
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
const auth = withStyles(getStylesFromProps)(SimpleStore.withStore(Auth))
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
