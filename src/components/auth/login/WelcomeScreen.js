import React, { useCallback, useContext, useEffect } from 'react'
import { Linking, View } from 'react-native'
import { t, Trans } from '@lingui/macro'

import { useSecurityDialog } from '../../security/securityDialog'
import CustomButton from '../../common/buttons/CustomButton'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'

import Auth from '../../auth/Auth'
import AuthProgressBar from '../components/AuthProgressBar'
import AuthTorus from '../../auth/torus/AuthTorus'

import Recover from '../../signin/Mnemonics'
import NavBar from '../../appNavigation/NavBar'
import { PrivacyPolicy, TermsOfUse } from '../../webView/webViewInstances'

import useOnPress from '../../../lib/hooks/useOnPress'
import Config from '../../../config/config'

import { createStackNavigator } from '../../appNavigation/stackNavigation'
import { getShadowStyles } from '../../../lib/utils/getStyles'
import { isBrowser, isMobileNative } from '../../../lib/utils/platform'

import { CLICK_GETSTARTED, CLICK_LEARNMORE, fireEvent, GOTO_WELCOME } from '../../../lib/analytics/analytics'

import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  isShortDevice,
  isVeryShortDevice,
} from '../../../lib/utils/sizes'

import { withStyles } from '../../../lib/styles'
import Illustration from '../../../assets/Auth/torusIllustration.svg'
import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'

const AuthScreen = Config.torusEnabled ? AuthTorus : Auth

const WelcomeScreen = ({ theme, styles, screenProps, navigation }) => {
  const { navigate } = navigation

  const { hasSyncedCodePush } = useContext(GlobalTogglesContext)
  const { securityEnabled, securityDialog } = useSecurityDialog()

  const onGetStarted = useCallback(() => {
    if (!isMobileNative || hasSyncedCodePush) {
      fireEvent(CLICK_GETSTARTED)
      navigate('Auth')
    }
  }, [navigate, hasSyncedCodePush])

  useEffect(() => {
    if (securityEnabled) {
      securityDialog()
    }
  }, [securityEnabled, securityDialog])

  const onLearnMore = useCallback(() => {
    fireEvent(CLICK_LEARNMORE)
    Linking.openURL('https://www.gooddollar.org/im-claiming-gs-now-where-and-how-can-i-use-them/')
  }, [])

  const handleGetStarted = useOnPress(onGetStarted)
  const handleLearnMore = useOnPress(onLearnMore)

  useEffect(() => {
    fireEvent(GOTO_WELCOME)
  }, [])

  return (
    <Wrapper backgroundColor={theme.colors.white} style={styles.mainWrapper}>
      <NavBar logo />
      <AuthProgressBar step={0} done={false} />
      <View style={styles.contentContainer}>
        <Text
          color={'primary'}
          fontSize={getDesignRelativeHeight(12)}
          lineHeight={getDesignRelativeHeight(21)}
          letterSpacing={0.26}
          fontFamily="Roboto"
          fontWeight="bold"
          textTransform="uppercase"
        >
          {t`Get started`}
        </Text>
        <Text
          color={'darkIndigo'}
          fontSize={getDesignRelativeHeight(26)}
          lineHeight={getDesignRelativeHeight(34)}
          letterSpacing={0.26}
          fontFamily="Roboto"
          fontWeight="bold"
          style={{ marginTop: getDesignRelativeHeight(14) }}
        >
          {t`Welcome to GoodDollar`}
        </Text>
        <Text
          color={'darkIndigo'}
          fontSize={getDesignRelativeHeight(18)}
          lineHeight={getDesignRelativeHeight(23)}
          letterSpacing={0.26}
          fontFamily="Roboto"
          style={{ marginTop: getDesignRelativeHeight(1) }}
        >
          <Trans>GoodDollar is a global community and a web application to help people join the digital economy.</Trans>
        </Text>
        <View>
          <Text
            color={'primary'}
            fontSize={getDesignRelativeHeight(16)}
            lineHeight={getDesignRelativeHeight(16)}
            letterSpacing={0.26}
            fontFamily="Roboto"
            fontWeight="bold"
            textDecorationLine="underline"
            style={{ marginTop: getDesignRelativeHeight(12) }}
            onPress={handleLearnMore}
          >
            {t`Learn More`}
          </Text>
        </View>
        <View style={styles.illustration}>
          <Illustration
            width={getDesignRelativeWidth(isBrowser ? 331 : 276, false)}
            height={getDesignRelativeHeight(217, false)}
            viewBox="0 0 248.327 194.594"
          />
        </View>
        <View style={{ alignItems: 'center' }}>
          <CustomButton
            color={'primary'}
            style={styles.buttonLayout}
            textStyle={styles.buttonText}
            onPress={handleGetStarted}
            disabled={isMobileNative && !hasSyncedCodePush}
          >
            {t`Get Started`}
          </CustomButton>
        </View>
      </View>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'flex-start',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: isVeryShortDevice ? 20 : 0,
      paddingTop: getDesignRelativeHeight(isShortDevice ? 35 : 45),
    },
    buttonLayout: {
      marginBottom: theme.sizes.default * (isShortDevice ? 1 : 5),
      ...getShadowStyles('none', { elevation: 0 }),
      minHeight: 40,
      height: isShortDevice ? 40 : 44,
      width: '100%',
      maxWidth: 384,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
    },
    illustration: {
      flex: 1,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 7, false),
      alignSelf: 'center',
    },
  }
}

const welcome = withStyles(getStylesFromProps)(WelcomeScreen)

welcome.navigationOptions = {
  title: t`Welcome to GoodDollar!`,
  navigationBarHidden: true,
}

const routes = {
  welcome,
  Auth: AuthScreen,
  TermsOfUse,
  PrivacyPolicy,
}

if (Config.enableSelfCustody) {
  Object.assign(routes, { Recover })
}

export default createStackNavigator(routes, {
  backRouteName: 'Auth',
})
