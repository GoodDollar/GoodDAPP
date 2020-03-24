// @flow
import React from 'react'
import { Image } from 'react-native'
import Mnemonics from '../signin/Mnemonics'
import logger from '../../lib/logger/pino-logger'
import { CLICK_BTN_GETINVITED, fireEvent } from '../../lib/analytics/analytics'
import CustomButton from '../common/buttons/CustomButton'
import Wrapper from '../common/layout/Wrapper'
import Text from '../common/view/Text'
import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { withStyles } from '../../lib/styles'
import illustration from '../../assets/Auth/Illustration.svg'
import config from '../../config/config'
import { theme as mainTheme } from '../theme/styles'
import Section from '../common/layout/Section'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { torusGoogle, useTorusServiceWorker } from './useTorus'

Image.prefetch(illustration)
const log = logger.child({ from: 'AuthTorus' })
const AuthTorus = ({ screenProps, navigation, styles, store }) => {
  const asGuest = true
  const [showErrorDialog] = useErrorDialog()
  const torusReady = useTorusServiceWorker()

  const goToW3Site = () => {
    fireEvent(CLICK_BTN_GETINVITED)
    window.location = config.web3SiteUrl
  }

  const handleSignUp = async () => {
    store.set('loadingIndicator')({ loading: true })
    const redirectTo = 'Phone'
    let torusUser
    try {
      torusUser = await torusGoogle.triggerLogin()
      log.debug('torus login success', { torusUser })
    } catch (e) {
      store.set('loadingIndicator')({ loading: false })
      log.error('torus login failed', e.message, e)
      showErrorDialog('We were unable to complete the login. Please try again.')
      return
    }

    try {
      if (indexedDB !== undefined) {
        const reqPromise = new Promise((res, rej) => {
          const req = indexedDB.deleteDatabase('radata')
          req.onsuccess = res
          req.onerror = rej
        })
        await reqPromise

        log.info('indexedDb successfully cleared')
      }
    } catch (e) {
      log.error('Failed to clear indexedDb', e.message, e)
    } finally {
      store.set('loadingIndicator')({ loading: false })
    }

    navigation.navigate(redirectTo, { torusUser })

    //Hack to get keyboard up on mobile need focus from user event such as click
    setTimeout(() => {
      const el = document.getElementById('Name_input')
      if (el) {
        el.focus()
      }
    }, 500)
  }

  const handleNavigateTermsOfUse = () => screenProps.push('TermsOfUse')

  const handleNavigatePrivacyPolicy = () => screenProps.push('PrivacyPolicy')

  const firstButtonHandler = asGuest ? handleSignUp : goToW3Site
  const firstButtonText = asGuest ? (
    'Login with Google'
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
              onPress={handleNavigateTermsOfUse}
            >
              Terms of Use
            </Text>
            {' and '}
            <Text
              fontSize={12}
              color="gray80Percent"
              fontWeight="bold"
              textDecorationLine="underline"
              onPress={handleNavigatePrivacyPolicy}
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
          disabled={torusReady === false}
        >
          {firstButtonText}
        </CustomButton>
      </Section>
    </Wrapper>
  )
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
const auth = withStyles(getStylesFromProps)(SimpleStore.withStore(AuthTorus))
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
