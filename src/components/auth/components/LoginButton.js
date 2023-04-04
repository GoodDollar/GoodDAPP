import React, { useCallback } from 'react'
import { TouchableOpacity } from 'react-native'

import { t } from '@lingui/macro'
import { noop } from 'lodash'
import Text from '../../common/view/Text'

import useOnPress from '../../../lib/hooks/useOnPress'
import {
  getDesignRelativeHeight,
  getDesignRelativeWidth,
  getMaxDeviceHeight,
  isSmallDevice,
} from '../../../lib/utils/sizes'
import normalizeText from '../../../lib/utils/normalizeText'

import { withStyles } from '../../../lib/styles'
import { theme as mainTheme } from '../../theme/styles'

import googleBtnIcon from '../../../assets/Auth/btn-google.svg'
import facebookBtnIcon from '../../../assets/Auth/btn-facebook.svg'
import useRecaptcha from './Recaptcha/useRecaptcha'

const LoginButtonComponent = ({
  style,
  styles,
  onPress,
  testID,
  icon: IconSVG,
  disabled,
  children,
  textColor,
  iconProps = {},
}) => {
  const onButtonPress = useOnPress(onPress)

  return (
    <TouchableOpacity
      style={[{ height: getDesignRelativeHeight(50) }, style]}
      onPress={onButtonPress}
      disabled={disabled}
      testID={testID}
    >
      {IconSVG ? <IconSVG {...iconProps} /> : null}
      <Text
        textTransform="uppercase"
        style={styles.buttonText}
        fontWeight={'bold'}
        letterSpacing={0}
        color={textColor || 'white'}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
}

const getLoginButtonStylesFromProps = ({ theme }) => {
  const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)

  return {
    buttonText: {
      fontSize: buttonFontSize,
      lineHeight: getDesignRelativeHeight(19),
      marginLeft: getDesignRelativeWidth(10),
    },
  }
}

const LoginButton = withStyles(getLoginButtonStylesFromProps)(LoginButtonComponent)

const buttonPrefix = 'Continue with'
const getStylesFromProps = ({ theme }) => {
  const shorterDevice = getMaxDeviceHeight() <= 622

  return {
    buttonLayout: {
      justifyContent: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 50,
      padding: 3,
    },
    buttonsMargin: {
      marginTop: getDesignRelativeHeight(shorterDevice ? theme.sizes.default : theme.sizes.defaultDouble),
    },
  }
}

LoginButton.Google = withStyles(getStylesFromProps)(
  ({ styles, disabled, onPress = noop, handleLoginMethod, ...props }) => {
    const _google = useCallback(() => {
      onPress()
      handleLoginMethod('google')
    }, [handleLoginMethod, onPress])

    return (
      <LoginButton
        style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.googleRed }]}
        onPress={_google}
        disabled={!handleLoginMethod || disabled}
        testID="login_with_google"
        icon={googleBtnIcon}
      >
        {t`${buttonPrefix} Google`}
      </LoginButton>
    )
  },
)

LoginButton.Facebook = withStyles(getStylesFromProps)(
  ({ styles, disabled, onPress = noop, handleLoginMethod, ...props }) => {
    const _facebook = useCallback(() => {
      onPress()
      handleLoginMethod('facebook')
    }, [handleLoginMethod])

    return (
      <LoginButton
        style={[
          styles.buttonLayout,
          styles.buttonsMargin,
          {
            backgroundColor: mainTheme.colors.facebookBlue,
          },
        ]}
        onPress={_facebook}
        disabled={!handleLoginMethod || disabled}
        testID="login_with_facebook"
        icon={facebookBtnIcon}
        iconProps={{ viewBox: '0 0 11 22' }}
      >
        {t`${buttonPrefix} Facebook`}
      </LoginButton>
    )
  },
)

LoginButton.Passwordless = withStyles(getStylesFromProps)(
  ({ styles, disabled, onPress = noop, handleLoginMethod, ...props }) => {
    const onRecaptchaSuccess = useCallback(() => {
      onPress()
      handleLoginMethod('auth0-pwdless-sms')
    }, [onPress, handleLoginMethod])

    const { Captcha, launchCaptcha } = useRecaptcha({
      autoLaunch: false,
      relaunchOnFailed: false,
      onSuccess: onRecaptchaSuccess,
    })

    return (
      <Captcha>
        <LoginButton
          style={[
            styles.buttonLayout,
            styles.buttonsMargin,
            {
              backgroundColor: mainTheme.colors.white,
              borderWidth: 1,
              borderColor: '#E9ECFF',
            },
          ]}
          onPress={launchCaptcha}
          disabled={!handleLoginMethod || disabled}
          textColor="#8499BB"
          testID="login_with_auth0"
        >
          {t`${buttonPrefix} Passwordless`}
        </LoginButton>
      </Captcha>
    )
  },
)

export default LoginButton
