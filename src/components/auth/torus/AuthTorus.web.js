// @flow
import React, { useCallback, useState } from 'react'
import { Paragraph } from 'react-native-paper'
import { View } from 'react-native'
import { get } from 'lodash'
import AsyncStorage from '../../../lib/utils/asyncStorage'
import logger from '../../../lib/logger/pino-logger'
import {
  fireEvent,
  SIGNIN_METHOD_SELECTED,
  SIGNIN_NOTEXISTS_LOGIN,
  SIGNIN_NOTEXISTS_SIGNUP,
  SIGNIN_TORUS_SUCCESS,
  SIGNUP_EXISTS_CONTINUE,
  SIGNUP_EXISTS_LOGIN,
  SIGNUP_METHOD_SELECTED,
  SIGNUP_STARTED,
  TORUS_FAILED,
  TORUS_SUCCESS,
} from '../../../lib/analytics/analytics'
import { GD_USER_MASTERSEED, GD_USER_MNEMONIC, IS_LOGGED_IN } from '../../../lib/constants/localStorage'
import { REGISTRATION_METHOD_TORUS } from '../../../lib/constants/login'
import { withStyles } from '../../../lib/styles'
import config from '../../../config/config'
import { theme as mainTheme } from '../../theme/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { useDialog } from '../../../lib/undux/utils/dialog'
import { showSupportDialog } from '../../common/dialogs/showSupportDialog'
import { decorate, ExceptionCode } from '../../../lib/logger/exceptions'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { isSmallDevice } from '../../../lib/utils/mobileSizeDetect'
import normalizeText from '../../../lib/utils/normalizeText'
import { userExists } from '../../../lib/login/userExists'
import ready from '../ready'
import SignIn from '../login/SignInScreen'
import SignUp from '../login/SignUpScreen'

import LoadingIcon from '../../common/modal/LoadingIcon'

// import SpinnerCheckMark from '../../common/animations/SpinnerCheckMark'

import { timeout } from '../../../lib/utils/async'
import useTorus from './hooks/useTorus'
import { LoginStrategy } from './sdk/strategies'

const log = logger.child({ from: 'AuthTorus' })

export const useAlreadySignedUp = () => {
  const [showDialog, hideDialog] = useDialog()

  const show = (
    provider,
    existsResult: { provider: string, identifier: boolean, email: boolean, mobile: boolean },
    fromSignupFlow,
  ) => {
    let resolve
    const promise = new Promise((res, rej) => {
      resolve = res
    })

    const registeredBy = LoginStrategy.getTitle(existsResult.provider)
    const usedText = existsResult.identifier ? 'Account' : existsResult.email ? 'Email' : 'Mobile'
    showDialog({
      onDismiss: () => {
        hideDialog()
        resolve('signup')
      },
      content: (
        <View style={alreadyStyles.paragraphContainer}>
          <Paragraph
            style={[alreadyStyles.paragraph, alreadyStyles.paragraphBold]}
          >{`You Already Used\n This ${usedText}\n When You Signed Up\n With ${registeredBy}`}</Paragraph>
        </View>
      ),
      buttons: [
        {
          text: `Login with ${registeredBy}`,
          onPress: () => {
            hideDialog()
            fireEvent(SIGNUP_EXISTS_LOGIN, { provider, existsResult, fromSignupFlow })
            resolve('signin')
          },
          style: [alreadyStyles.marginBottom, { boxShadow: 'none' }],
        },
        {
          text: 'Continue Signup',
          onPress: () => {
            hideDialog()
            fireEvent(SIGNUP_EXISTS_CONTINUE, { provider, existsResult, fromSignupFlow })
            resolve('signup')
          },
          style: alreadyStyles.whiteButton,
          textStyle: alreadyStyles.primaryText,
        },
      ],
      buttonsContainerStyle: alreadyStyles.modalButtonsContainerStyle,
      type: 'error',
    })
    return promise
  }
  return show
}

const AuthTorus = ({ screenProps, navigation, styles, store }) => {
  const [showDialog, hideDialog, showErrorDialog] = useDialog()
  const showAlreadySignedUp = useAlreadySignedUp()
  const [torusSDK, sdkInitialized] = useTorus()
  const { navigate } = navigation
  const [authScreen, setAuthScreen] = useState(get(navigation, 'state.params.screen', 'signup'))
  const isSignup = authScreen === 'signup'

  const getTorusUser = useCallback(
    async provider => {
      let torusUser, replacing

      try {
        if (['development', 'test'].includes(config.env)) {
          torusUser = await AsyncStorage.getItem('TorusTestUser')
        }

        if (torusUser == null) {
          torusUser = await torusSDK.triggerLogin(provider)
        }

        fireEvent(TORUS_SUCCESS, { provider })

        const curSeed = await AsyncStorage.getItem(GD_USER_MASTERSEED)
        const curMnemonic = await AsyncStorage.getItem(GD_USER_MNEMONIC)

        if (curMnemonic || (curSeed && curSeed !== torusUser.privateKey)) {
          await AsyncStorage.clear()
          replacing = true
        }

        //set masterseed so wallet can use it in 'ready' where we check if user exists
        await AsyncStorage.setItem(GD_USER_MASTERSEED, torusUser.privateKey)
        log.debug('torus login success', { torusUser, provider })
      } catch (e) {
        // store.set('loadingIndicator')({ loading: false })
        fireEvent(TORUS_FAILED, { provider, error: e.message })
        if (e.message === 'user closed popup') {
          log.info(e.message, e)
        } else {
          log.error('torus login failed', e.message, e, { dialogShown: true })
        }

        showErrorDialog('We were unable to complete the signup. Please try again.')
      }
      return { torusUser, replacing }
    },
    [showErrorDialog, torusSDK],
  )

  const showLoadingDialog = () => {
    showDialog({
      image: <LoadingIcon />,
      loading: true,
      message: 'Please wait\nThis might take a few seconds...',
      showButtons: false,
      title: `PREPARING\nYOUR WALLET`,
      showCloseButtons: false,
    })
  }

  const showNotSignedUp = provider => {
    let resolve
    const promise = new Promise((res, rej) => {
      resolve = res
    })
    showDialog({
      onDismiss: hideDialog,
      content: (
        <View style={styles.paragraphContainer}>
          <Paragraph
            style={[styles.paragraph, styles.paragraphBold]}
          >{`Hi There,\n did You Mean\n to Signup?`}</Paragraph>
          <View style={{ marginTop: mainTheme.sizes.defaultDouble }}>
            <Paragraph
              style={[styles.paragraph, styles.paragraphContent]}
            >{`The account doesn’t exist\n or you signed up using`}</Paragraph>
            <Paragraph style={[styles.paragraphContent, styles.paragraphBold]}>another method</Paragraph>
          </View>
        </View>
      ),
      buttons: [
        {
          text: 'Signup',
          onPress: () => {
            fireEvent(SIGNIN_NOTEXISTS_SIGNUP, { provider })
            hideDialog()
            resolve('signup')
          },
          style: [styles.whiteButton, { flex: 1 }],
          textStyle: styles.primaryText,
        },
        {
          text: 'Login',
          onPress: () => {
            fireEvent(SIGNIN_NOTEXISTS_LOGIN, { provider })
            hideDialog()
            resolve('signin')
          },
          style: { flex: 1 },
        },
      ],
      buttonsContainerStyle: styles.modalButtonsContainerRow,
      type: 'error',
    })
    return promise
  }

  const handleLoginMethod = async (
    provider: 'facebook' | 'google' | 'auth0' | 'auth0-pwdless-email' | 'auth0-pwdless-sms',
  ) => {
    fireEvent(isSignup ? SIGNUP_METHOD_SELECTED : SIGNIN_METHOD_SELECTED, { method: provider })

    showLoadingDialog()
    const { torusUser, replacing } = await getTorusUser(provider)
    if (torusUser == null) {
      hideDialog()
      return
    }

    try {
      const existsResult = await userExists(torusUser)
      log.debug('checking userAlreadyExist', { isSignup, existsResult })
      let selection = authScreen
      if (isSignup) {
        //if user identifier exists or email/mobile found in another account
        if (existsResult.exists) {
          selection = await showAlreadySignedUp(provider, existsResult)
          if (selection === 'signin') {
            return setAuthScreen('signin')
          }
        }
      } else if (isSignup === false && existsResult.identifier !== true) {
        //no account with identifier found = user didnt signup
        selection = await showNotSignedUp(provider)
        return setAuthScreen(selection)
      }

      //user chose to continue signup even though used on another provider
      //or user signed in and account exists
      await Promise.race([ready(replacing), timeout(60000, 'initialiazing wallet timed out')])
      hideDialog()

      if (isSignup) {
        fireEvent(SIGNUP_STARTED, { provider })

        //Hack to get keyboard up on mobile need focus from user event such as click
        setTimeout(() => {
          const el = document.getElementById('Name_input')
          if (el) {
            el.focus()
          }
        }, 500)
        return navigate('Signup', {
          regMethod: REGISTRATION_METHOD_TORUS,
          torusUser,
          torusProvider: provider,
        })
      }

      //case of sign-in
      fireEvent(SIGNIN_TORUS_SUCCESS, { provider })
      await AsyncStorage.setItem(IS_LOGGED_IN, true)
      store.set('isLoggedIn')(true)
    } catch (e) {
      const { message } = e
      const uiMessage = decorate(e, ExceptionCode.E14)
      showSupportDialog(showErrorDialog, hideDialog, navigation.navigate, uiMessage)
      log.error('Failed to initialize wallet and storage', message, e)
    } finally {
      store.set('loadingIndicator')({ loading: false })
    }
  }

  const goBack = () => navigate('Welcome')

  // const auth0ButtonHandler = () => {
  //   if (config.torusEmailEnabled) {
  //     setPasswordless(true)
  //     fireEvent(SIGNUP_METHOD_SELECTED, { method: 'auth0-pwdless' })
  //   } else {
  //     signupAuth0Mobile()
  //   }
  // }

  // const signupAuth0Email = () => signupAuth0('email')
  // const signupAuth0Mobile = () => signupAuth0('mobile')

  if (authScreen === 'signin') {
    return <SignIn handleLoginMethod={handleLoginMethod} sdkInitialized={sdkInitialized} goBack={goBack} />
  }
  return (
    <SignUp
      screenProps={screenProps}
      navigation={navigation}
      handleLoginMethod={handleLoginMethod}
      sdkInitialized={sdkInitialized}
      goBack={goBack}
    />
  )
}

const getStylesFromProps = ({ theme }) => {
  const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)

  return {
    textBlack: {
      color: theme.fontStyle.color,
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
      boxShadow: 'none',
    },
    buttonText: {
      fontSize: buttonFontSize,
      flex: 1,
    },
    paragraph: {
      fontSize: normalizeText(24),
      textAlign: 'center',
      color: theme.colors.red,
      lineHeight: 32,
      fontFamily: theme.fonts.slab,
    },
    marginBottom: {
      marginBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    },
    paragraphContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    modalButtonsContainerStyle: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
    modalButtonsContainerRow: {
      flex: 1,
      flexDirection: 'row',
      maxHeight: getDesignRelativeHeight(30),
      marginBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
    },
    whiteButton: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      boxShadow: 'none',
    },
    primaryText: {
      color: mainTheme.colors.primary,
    },
    paragraphContent: {
      fontSize: normalizeText(16),
      lineHeight: 22,
      color: theme.colors.darkGray,
      fontFamily: theme.fonts.default,
    },
    paragraphBold: {
      textAlign: 'center',
      fontWeight: 'bold',
    },
    fixMargin: {
      marginVertical: -6,
      marginHorizontal: -13,
    },
    iconBorder: {
      backgroundColor: theme.colors.white,
      borderRadius: 50,
      zIndex: -1,
      alignItems: 'center',
      paddingVertical: getDesignRelativeHeight(9),
      paddingHorizontal: getDesignRelativeHeight(15),
    },
    iconsStyle: {
      width: getDesignRelativeHeight(14),
      height: getDesignRelativeHeight(26),
    },
  }
}
const Auth = withStyles(getStylesFromProps)(SimpleStore.withStore(AuthTorus))
Auth.navigationOptions = {
  title: 'Auth',
  navigationBarHidden: true,
}

const alreadyStyles = {
  paragraphContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalButtonsContainerStyle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  whiteButton: {
    backgroundColor: mainTheme.colors.white,
    borderWidth: 1,
    borderColor: mainTheme.colors.primary,
    boxShadow: 'none',
  },
  primaryText: {
    color: mainTheme.colors.primary,
  },
  paragraphContent: {
    fontSize: normalizeText(16),
    lineHeight: 22,
    color: mainTheme.colors.darkGray,
    fontFamily: mainTheme.fonts.default,
  },
  paragraphBold: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: normalizeText(24),
    textAlign: 'center',
    color: mainTheme.colors.red,
    lineHeight: 32,
    fontFamily: mainTheme.fonts.slab,
  },
  marginBottom: {
    marginBottom: getDesignRelativeHeight(mainTheme.sizes.defaultDouble),
  },
}

export default Auth
