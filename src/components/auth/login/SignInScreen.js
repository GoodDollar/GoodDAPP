// @flow
/*eslint-disable*/
import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import { withStyles } from '../../../lib/styles'
import illustration from '../../../assets/Auth/Illustrations_woman_love.svg'
import googleBtnIcon from '../../../assets/Auth/btn_google.svg'
import facebookBtnIcon from '../../../assets/Auth/btn_facebook.svg'
import { isBrowser } from '../../../lib/utils/platform'
import config from '../../../config/config'
import { theme as mainTheme } from '../../theme/styles'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import normalizeText from '../../../lib/utils/normalizeText'

// import SpinnerCheckMark from '../../common/animations/SpinnerCheckMark'

Image.prefetch(illustration)

const SigninScreen = ({
  screenProps,
  navigation,
  styles,
  store,
  asGuest,
  handleNavigateTermsOfUse,
  handleNavigatePrivacyPolicy,
  goToManualRegistration,
  googleButtonHandler,
  sdkInitialized,
  facebookButtonTextStyle,
  facebookButtonHandler,
  ShowPasswordless,
  goToSignIn,
  goBack,
}) => {
  return (
    <Wrapper backgroundColor="#fff" style={styles.mainWrapper}>
      <NavBar title="Login" goBack={goBack} />
      <Text
        style={styles.headerText}
        fontSize={26}
        lineHeight={34}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
      >
        Welcome Back!
      </Text>
      <Image source={illustration} style={styles.illustration} resizeMode="contain" />
      <Section style={styles.bottomContainer}>
        {asGuest && (
          <Text fontSize={12} color="gray80Percent" style={styles.privacyAndTerms}>
            {`Remember to login with the `}
            <Text
              fontSize={12}
              color="gray80Percent"
              fontWeight="bold"
              textDecorationLine="underline"
              onPress={handleNavigateTermsOfUse}
            />
            <Text fontSize={12} color="gray80Percent" fontWeight="bold">
              {`same login method\n`}
            </Text>
            that you’ve signed up with
          </Text>
        )}
        {config.enableSelfCustody && (
          <>
            <Section.Row alignItems="center" justifyContent="center">
              <TouchableOpacity onPress={goToManualRegistration}>
                <Section.Text
                  fontWeight="medium"
                  style={styles.recoverText}
                  textStyle={[styles.buttonText]}
                  textDecorationLine="underline"
                  fontSize={14}
                  color="primary"
                >
                  Agree & Continue with self custody wallet
                </Section.Text>
              </TouchableOpacity>
            </Section.Row>
            <Section.Row alignItems="center" justifyContent="center" style={styles.signInLink}>
              <TouchableOpacity onPress={goToSignIn}>
                <Section.Text
                  fontWeight="medium"
                  style={styles.haveIssuesText}
                  textStyle={[styles.buttonText]}
                  textDecorationLine="underline"
                  fontSize={14}
                  color="primary"
                >
                  Sign in
                </Section.Text>
              </TouchableOpacity>
            </Section.Row>
          </>
        )}
        <TouchableOpacity
          style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.googleBlue }]}
          onPress={googleButtonHandler}
          disabled={!sdkInitialized}
          testID="login_with_google"
        >
          <View style={styles.iconBorder}>
            <Image source={googleBtnIcon} resizeMode="contain" style={styles.iconsStyle} />
          </View>
          <Text textTransform="uppercase" style={styles.buttonText} fontWeight={500} letterSpacing={0} color="white">
            Log in with Google
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.facebookBlue }]}
          onPress={facebookButtonHandler}
          disabled={!sdkInitialized}
          testID="login_with_facebook"
        >
          <View style={styles.iconBorder}>
            <Image source={facebookBtnIcon} resizeMode="contain" style={styles.iconsStyle} />
          </View>
          <Text textTransform="uppercase" style={styles.buttonText} fontWeight={500} letterSpacing={0} color="white">
            Log in with Facebook
          </Text>
        </TouchableOpacity>
        <ShowPasswordless />
      </Section>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => {
  const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)

  return {
    mainWrapper: {
      paddingHorizontal: 0,
      paddingVertical: 0,
      justifyContent: 'space-between',
      flexGrow: 1,
    },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
      paddingBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
      justifyContent: 'space-around',
      minHeight: getDesignRelativeHeight(200),
    },
    buttonLayout: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      flex: 1,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 50,
      padding: 3,
    },
    googleButtonLayout: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      borderWidth: 0,
      boxShadow: '0 3px 15px -6px rgba(0,0,0,0.6)',
    },
    googleButtonContent: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    googleIcon: {
      width: getDesignRelativeHeight(20),
      height: getDesignRelativeHeight(20),
      marginRight: getDesignRelativeWidth(10, false),
    },
    buttonText: {
      fontSize: buttonFontSize,
      flex: 1,
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      width: getDesignRelativeWidth(249),
      height: getDesignRelativeHeight(isBrowser ? 172 : 150),
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingTop: getDesignRelativeHeight(theme.sizes.default),
    },
    headerText: {
      marginTop: getDesignRelativeHeight(30),
      marginBottom: getDesignRelativeHeight(20),
    },
    privacyAndTerms: {
      marginBottom: getDesignRelativeHeight(16),
    },
    signInLink: {
      marginTop: getDesignRelativeHeight(5),
      marginBottom: getDesignRelativeHeight(5),
    },
    iconsStyle: {
      width: getDesignRelativeHeight(20),
      height: getDesignRelativeHeight(20),
    },
    iconBorder: {
      backgroundColor: theme.colors.white,
      borderRadius: 50,
      zIndex: -1,
      alignItems: 'center',
      padding: getDesignRelativeHeight(12),
    },
  }
}

const loginScreen = withStyles(getStylesFromProps)(SimpleStore.withStore(SigninScreen))

loginScreen.navigationOptions = {
  title: 'Login',
  navigationBarHidden: false,
}

export default loginScreen
