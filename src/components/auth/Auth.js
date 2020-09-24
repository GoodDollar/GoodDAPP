// @flow
import React from 'react'
import { get } from 'lodash'
import AsyncStorage from '../../lib/utils/asyncStorage'
import Recover from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import { CLICK_BTN_GETINVITED, fireEvent, SIGNUP_METHOD_SELECTED } from '../../lib/analytics/analytics'
import CustomButton from '../common/buttons/CustomButton'
import { PushButton } from '../appNavigation/PushButton'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { PrivacyPolicy, PrivacyPolicyAndTerms, SupportForUnsigned } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import AnimationsPeopleFlying from '../common/animations/PeopleFlying'
import config from '../../config/config'
import { theme as mainTheme } from '../theme/styles'
import Section from '../common/layout/Section'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import SimpleStore from '../../lib/undux/SimpleStore'
import { deleteGunDB } from '../../lib/hooks/useDeleteAccountDialog'
import { REGISTRATION_METHOD_SELF_CUSTODY } from '../../lib/constants/login'

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
  }

  async componentWillMount() {
    await this.checkPaymentCode()
  }

  checkPaymentCode = async () => {
    const destinationPath = await AsyncStorage.getItem('GD_destinationPath')
    const paymentCode = get(destinationPath, 'params.paymentCode')

    log.info('check paymentCode', paymentCode)

    if (paymentCode) {
      return this.setState({
        asGuest: true,
      })
    }
  }

  handleSignUp = async () => {
    const { store } = this.props

    store.set('loadingIndicator')({ loading: true })

    try {
      const req = deleteGunDB()
      await req

      log.info('indexedDb successfully cleared')
    } catch (e) {
      log.error('Failed to clear indexedDb', e.message, e)
    } finally {
      store.set('loadingIndicator')({ loading: false })
    }

    fireEvent(SIGNUP_METHOD_SELECTED, { method: REGISTRATION_METHOD_SELF_CUSTODY })

    this.props.navigation.navigate('Signup', { regMethod: REGISTRATION_METHOD_SELF_CUSTODY })

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

  handleNavigateTermsOfUse = () => this.props.screenProps.push('PrivacyPolicyAndTerms')

  handleNavigatePrivacyPolicy = () => this.props.screenProps.push('PrivacyPolicy')

  goToW3Site = () => {
    fireEvent(CLICK_BTN_GETINVITED)
    window.location = config.web3SiteUrl
  }

  render() {
    const { styles } = this.props
    const { asGuest } = this.state
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
      <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
        <Text style={styles.headerText} fontSize={22} lineHeight={25} fontFamily="Roboto" fontWeight="medium">
          {'Welcome to\nGoodDollar Wallet'}
        </Text>
        <AnimationsPeopleFlying />
        <Section style={styles.bottomContainer}>
          {asGuest && (
            <Text fontSize={12} color="gray80Percent">
              {`By clicking the 'Create a wallet' button,\nyou are accepting our`}
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
          )}
          <CustomButton
            color={firstButtonColor}
            style={styles.buttonLayout}
            textStyle={firstButtonTextStyle}
            onPress={firstButtonHandler}
          >
            {firstButtonText}
          </CustomButton>
          <PushButton dark={false} mode="outlined" onPress={this.handleSignIn}>
            <Text style={styles.buttonText} fontWeight="regular" color={'primary'}>
              ALREADY REGISTERED?
              <Text textTransform={'uppercase'} style={styles.buttonText} color={'primary'} fontWeight="black">
                {' SIGN IN'}
              </Text>
            </Text>
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
      marginTop: 20,
      marginBottom: 20,
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
      maxWidth: '100%',
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

const routes = {
  Login: auth,
  PrivacyPolicyAndTerms,
  PrivacyPolicy,
  Support: SupportForUnsigned,
  Recover,
}

export default createStackNavigator(routes, { backRouteName: 'Auth' })
