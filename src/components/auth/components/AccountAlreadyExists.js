import React, { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import Text from '../../common/view/Text'
import { withStyles } from '../../../lib/styles'
import { theme as mainTheme } from '../../theme/styles'

import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  getMaxDeviceHeight,
  isShortDevice,
  isVeryShortDevice,
} from '../../../lib/utils/sizes'
import { isBrowser } from '../../../lib/utils/platform'
import { LoginButton } from '../login/LoginButton'
import useOnPress from '../../../lib/hooks/useOnPress'
import { LoginStrategy } from '../torus/sdk/strategies'

import Illustration from '../../../assets/Auth/account_exist.svg'
import facebookBtnIcon from '../../../assets/Auth/btn-facebook.svg'

import { fireEvent, SIGNUP_EXISTS, SIGNUP_EXISTS_CONTINUE, SIGNUP_EXISTS_LOGIN } from '../../../lib/analytics/analytics'

const AccountAlreadyExistsScreen = ({ screenProps, styles, checkResult, onContinueSignup }) => {
  const { provider, email } = checkResult || {}
  const usedText = email ? 'Email' : 'Mobile'
  const registeredBy = LoginStrategy.getTitle(provider)
  const buttonPrefix = 'Continue with'

  const handleLoginMethod = useCallback(() => {
    // TODO: need a way to pass provider we trying to log in and fromSignupFlow flag
    //fireEvent(SIGNUP_EXISTS_LOGIN, { provider, existsResult, fromSignupFlow })
    fireEvent(SIGNUP_EXISTS_LOGIN, { checkResult })

    // TODO: implement login with provider
  }, [checkResult, onContinueSignup])

  const _onContinueSignup = useOnPress(() => {
    // TODO: need a way to pass provider we trying to log in and fromSignupFlow flag
    //fireEvent(SIGNUP_EXISTS_CONTINUE, { provider, existsResult, fromSignupFlow })
    fireEvent(SIGNUP_EXISTS_CONTINUE, { checkResult })
    onContinueSignup('signup')
  }, [checkResult, onContinueSignup])

  const _onLoginWithProvider = useOnPress(() => {
    onContinueSignup()
    handleLoginMethod()
  }, [handleLoginMethod])

  useEffect(() => {
    // TODO: need a way to pass provider we trying to log in and fromSignupFlow flag
    //fireEvent(SIGNUP_EXISTS, { provider, existsResult, fromSignupFlow })
    fireEvent(SIGNUP_EXISTS, { checkResult })
  }, [checkResult])

  return (
    <View style={styles.contentContainer}>
      <View>
        <Text
          color={'darkIndigo'}
          fontSize={getDesignRelativeHeight(26)}
          lineHeight={getDesignRelativeHeight(34)}
          letterSpacing={0.26}
          fontFamily="Roboto"
          fontWeight="bold"
        >
          Something Went Wrong
        </Text>
        <Text
          color={'darkIndigo'}
          fontSize={getDesignRelativeHeight(18)}
          lineHeight={getDesignRelativeHeight(23)}
          letterSpacing={0.26}
          fontFamily="Roboto"
          style={{ marginTop: getDesignRelativeHeight(8) }}
        >
          {`It seems there is already an account for\n that ${usedText} using ${registeredBy}`}
        </Text>
        <View style={styles.illustration}>
          <Illustration
            width={getDesignRelativeWidth(isBrowser ? 290 : 268)}
            height={getDesignRelativeHeight(217)}
            viewBox="0 0 268 217"
          />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <View style={{ width: '100%' }}>
          <LoginButton
            style={[
              styles.buttonLayout,
              styles.buttonsMargin,
              {
                backgroundColor: mainTheme.colors.facebookBlue,
              },
            ]}
            onPress={_onLoginWithProvider}
            testID="login_with_facebook"
            icon={facebookBtnIcon}
            iconProps={{ viewBox: '0 0 11 22' }}
          >
            {`${buttonPrefix} ${registeredBy}`}
          </LoginButton>
          <LoginButton
            style={[
              styles.buttonLayout,
              styles.buttonsMargin,
              {
                backgroundColor: mainTheme.colors.white,
                borderWidth: 1,
                borderColor: mainTheme.colors.primary,
              },
            ]}
            textColor="primary"
            onPress={_onContinueSignup}
            testID="login_with_auth0"
          >
            Create A New Account
          </LoginButton>
        </View>
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  const shorterDevice = getMaxDeviceHeight() <= 622

  return {
    contentContainer: {
      flex: 1,
      paddingBottom: isVeryShortDevice ? 20 : 0,
      paddingTop: getDesignRelativeHeight(isShortDevice ? 35 : 45),
    },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 4),
      maxWidth: 384,
      width: '100%',
      alignSelf: 'center',
    },
    buttonLayout: {
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 50,
      padding: 3,
    },
    illustration: {
      flex: 1,
      marginTop: getDesignRelativeHeight(theme.sizes.default * 4, false),
      alignSelf: 'center',
    },
    buttonsMargin: {
      marginTop: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.defaultDouble),
    },
    textButton: {
      height: 23,
      minHeight: 23,
      flexDirection: 'column',
    },
    textButtonContainer: {
      marginVertical: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.default * 3),
    },
  }
}

const AccountAlreadyExists = withStyles(getStylesFromProps)(AccountAlreadyExistsScreen)

export default AccountAlreadyExists
