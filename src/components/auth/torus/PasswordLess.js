import React from 'react'
import { getDesignRelativeHeight, isSmallDevice } from '../../../lib/utils/sizes'
import { getShadowStyles } from '../../../lib/utils/getStyles'
import Section from '../../common/layout/Section'
import CustomButton from '../../common/buttons/CustomButton'
import { theme as mainTheme } from '../../theme/styles'
import normalizeText from '../../../lib/utils/normalizeText'
import MobileBtnIcon from '../../../assets/Auth/btn_mobile.svg'
import { withStyles } from '../../../lib/styles'
import { fireEvent, SIGNIN_METHOD_SELECTED, SIGNUP_METHOD_SELECTED } from '../../../lib/analytics/analytics'
import { LoginButton } from '../login/LoginButton'
import useTorus from './hooks/useTorus'

const ShowPasswordless = ({ isSignup = true, isOpen, styles, onSelect, handleLoginMethod }) => {
  const [, sdkInitialized] = useTorus()

  // const _email = useCallback(() => {
  //   handleLoginMethod('auth0-pwdless-email')
  // })

  const _mobile = () => handleLoginMethod('auth0-pwdless-sms')

  const _onSelect = () => {
    fireEvent(isSignup ? SIGNUP_METHOD_SELECTED : SIGNIN_METHOD_SELECTED, { method: 'auth0-pwdless' })
    onSelect()
  }

  if (isOpen) {
    return (
      <Section.Row>
        <LoginButton
          style={[styles.buttonLayout, { backgroundColor: mainTheme.colors.darkBlue }]}
          onPress={_mobile}
          disabled={!sdkInitialized}
          testID="login_with_auth0"
          icon={MobileBtnIcon}
        >
          {`${isSignup ? 'Agree & Sign Up' : 'Log in'} Passwordless`}
        </LoginButton>
        {/* <CustomButton
          color={mainTheme.colors.darkBlue}
          style={[styles.buttonLayout, { flex: 1, marginRight: getDesignRelativeWidth(5) }]}
          textStyle={[styles.buttonText]}
          onPress={_mobile}
          disabled={!sdkInitialized}
          testID="login_via_mobile"
          compact={isSmallDevice || isMediumDevice}
        >
          Via Phone Code
        </CustomButton>
        <CustomButton
          color={mainTheme.colors.darkBlue}
          style={[styles.buttonLayout, { flex: 1, marginLeft: getDesignRelativeWidth(5) }]}
          textStyle={[styles.buttonText]}
          onPress={_email}
          disabled={!sdkInitialized}
          testID="login_via_email"
          compact={isSmallDevice || isMediumDevice}
        >
          Via Email Code
        </CustomButton> */}
      </Section.Row>
    )
  }
  return (
    <CustomButton
      compact
      mode={'text'}
      color={mainTheme.colors.darkGray}
      textStyle={{ textDecorationLine: 'underline', fontSize: 14, fontWeight: 'bold' }}
      onPress={_onSelect}
      style={styles.textButton}
    >
      {isSignup ? `Don't Have Social Accounts? Try This >` : `Signed Up Via Passwordless? Login Here >`}
    </CustomButton>
  )
}

const getStylesFromProps = ({ theme }) => {
  const buttonFontSize = normalizeText(isSmallDevice ? 13 : 16)

  return {
    buttonLayout: {
      flex: 1,
      justifyContent: 'space-between',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 50,
      padding: 3,
      ...getShadowStyles('none'),
    },
    buttonText: {
      fontSize: buttonFontSize,
      flex: 1,
    },
    marginBottom: {
      marginBottom: getDesignRelativeHeight(theme.sizes.defaultDouble),
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
    textButton: {
      marginTop: getDesignRelativeHeight(theme.sizes.default),
    },
  }
}
export const PasswordLess = withStyles(getStylesFromProps)(ShowPasswordless)
