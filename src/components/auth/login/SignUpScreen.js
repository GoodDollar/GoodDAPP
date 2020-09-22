// @flow
/*eslint-disable*/
import React from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import Wrapper from '../../common/layout/Wrapper'
import Text from '../../common/view/Text'
import NavBar from '../../appNavigation/NavBar'
import { withStyles } from '../../../lib/styles'
import { theme as mainTheme } from '../../theme/styles'
import { isBrowser } from '../../../lib/utils/platform'
import AnimationsPeopleFlying from '../../common/animations/PeopleFlying'
import config from '../../../config/config'
import Section from '../../common/layout/Section'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { isMediumDevice, isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import normalizeText from '../../../lib/utils/normalizeText'
import googleBtnIcon from '../../../assets/Auth/btn_google.svg'
import facebookBtnIcon from '../../../assets/Auth/btn_facebook.svg'

// import { delay } from '../../../lib/utils/async'

// import SpinnerCheckMark from '../../common/animations/SpinnerCheckMark'

const SignupScreen = ({
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
      <NavBar title="Signup" goBack={goBack} />
      <Text
        style={styles.headerText}
        fontSize={26}
        lineHeight={34}
        letterSpacing={0.26}
        fontFamily="Roboto"
        fontWeight="bold"
      >
        Welcome to GoodDollar!
      </Text>
      <View style={!isBrowser && styles.illustration}>
        <AnimationsPeopleFlying />
      </View>
      <Section style={styles.bottomContainer}>
        {asGuest && (
          <Text fontSize={12} color="gray80Percent" style={styles.marginBottom}>
            {`By Signing up you are accepting our \n`}
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
        {config.enableSelfCustody && (
          <>
            <Section.Row alignItems="center" justifyContent="center">
              <TouchableOpacity onPress={goToManualRegistration}>
                <Section.Text
                  fontWeight="medium"
                  style={styles.recoverText}
                  textStyle={styles.buttonText}
                  textDecorationLine="underline"
                  fontSize={14}
                  color="primary"
                >
                  Agree & Continue with self custody wallet
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
            {`Agree & Sign up with Google`}
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
            {`Agree & Sign up with Facebook`}
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
    buttonText: {
      fontSize: buttonFontSize,
      flex: 1,
    },
    illustration: {
      flexGrow: 1,
      flexShrink: 0,
      marginBottom: getDesignRelativeHeight(theme.sizes.default),
      width: getDesignRelativeWidth(249),
      height: getDesignRelativeHeight(150),
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingTop: getDesignRelativeHeight(theme.sizes.default),
      flex: 1,
      justifyContent: 'center',
    },
    headerText: {
      marginTop: getDesignRelativeHeight(30),
      marginBottom: getDesignRelativeHeight(20),
    },
    marginBottom: {
      marginBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    },
    fixMargin: {
      marginVertical: -6,
      marginHorizontal: -13,
    },
  }
}

const signupScreen = withStyles(getStylesFromProps)(SimpleStore.withStore(SignupScreen))

signupScreen.navigationOptions = {
  title: 'Signup',
  navigationBarHidden: false,
}

export default signupScreen
