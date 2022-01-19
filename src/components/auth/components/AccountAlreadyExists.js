import React, { useCallback, useEffect, useMemo } from 'react'
import { View } from 'react-native'
import { upperFirst } from 'lodash'
import Text from '../../common/view/Text'
import { withStyles } from '../../../lib/styles'
import { theme as mainTheme } from '../../theme/styles'

import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  getMaxDeviceHeight,
  isShortDevice,
} from '../../../lib/utils/sizes'
import { isBrowser } from '../../../lib/utils/platform'
import { LoginStrategy } from '../torus/sdk/strategies'

import Illustration from '../../../assets/Auth/account_exist.svg'

import { fireEvent, SIGNUP_EXISTS, SIGNUP_EXISTS_CONTINUE, SIGNUP_EXISTS_LOGIN } from '../../../lib/analytics/analytics'
import LoginButton from './LoginButton'

const AccountAlreadyExistsScreen = ({
  screenProps,
  styles,
  handleLoginMethod,
  checkResult,
  eventVars,
  onContinueSignup,
  setWalletPreparing,
  setAlreadySignedUp,
  torusInitialized,
}) => {
  const { provider, email } = checkResult || {}
  const usedText = email ? 'Email' : 'Mobile'
  const registeredBy = LoginStrategy.getTitle(provider)

  const LoginButtonComponent = useMemo(() => {
    let loginComponent = 'Passwordless'

    if (['google', 'facebook'].includes(provider)) {
      loginComponent = upperFirst(provider)
    }

    return LoginButton[loginComponent]
  }, [provider])

  const _onContinueSignup = useCallback(() => {
    fireEvent(SIGNUP_EXISTS_CONTINUE, { checkResult, ...eventVars })
    setAlreadySignedUp(false)
    onContinueSignup('signup')
  }, [checkResult, eventVars])

  const _onLoginWithProvider = useCallback(() => {
    fireEvent(SIGNUP_EXISTS_LOGIN, { checkResult, ...eventVars })
    setWalletPreparing(true)
    setAlreadySignedUp(false)
    onContinueSignup()
  }, [checkResult, eventVars, onContinueSignup, setWalletPreparing, setAlreadySignedUp])

  useEffect(() => {
    fireEvent(SIGNUP_EXISTS, { checkResult, ...eventVars })
  }, [checkResult, eventVars])

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
          {`You Already Have A\n G$ Account`}
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
            width={getDesignRelativeWidth(isBrowser ? 314 : 268)}
            height={getDesignRelativeHeight(217)}
            viewBox="0 0 314 189"
          />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <View style={{ width: '100%' }}>
          <LoginButtonComponent
            onPress={_onLoginWithProvider}
            disabled={!torusInitialized}
            handleLoginMethod={handleLoginMethod}
          />
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
            testID="continue_signup"
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
      paddingBottom: getDesignRelativeHeight(isShortDevice ? 35 : 45),
      paddingTop: getDesignRelativeHeight(isShortDevice ? 35 : 45),
      justifyContent: 'space-between',
    },
    bottomContainer: {
      paddingHorizontal: theme.sizes.defaultDouble,
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
