import React, { Fragment, useCallback, useMemo } from 'react'
import { Image, Platform, StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { get, noop } from 'lodash'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { t } from '@lingui/macro'
import { SvgUri as Svg } from 'react-native-svg'
import useCountryFlagUrl from '../../lib/hooks/useCountryFlagUrl'
import Icon from '../common/view/Icon'
import InputRounded from '../common/form/InputRounded'
import ErrorText from '../common/form/ErrorText'
import Section from '../common/layout/Section'
import { withStyles } from '../../lib/styles'
import API from '../../lib/API'
import { isMobileNative } from '../../lib/utils/platform'
import PhoneInput from './PhoneNumberInput/PhoneNumberInput'

const defaultErrors = {}
const defaultStoredProfile = {}
const defaultProfile = {}

const ProfileDataTable = ({
  profile = defaultProfile,
  storedProfile = defaultStoredProfile,
  onChange,
  errors = defaultErrors,
  editable,
  theme,
  styles,
  screenProps,
  setLockSubmit = noop,
  showCustomFlag,
}) => {
  const { mobile } = profile || {}
  const phoneMeta = useMemo(() => (showCustomFlag && mobile ? parsePhoneNumberFromString(mobile) : null), [
    showCustomFlag,
    mobile,
  ])
  const countryFlagUrl = useCountryFlagUrl(phoneMeta ? phoneMeta.country : undefined)

  const verifyEdit = useCallback(
    (field, content) => {
      screenProps.push('VerifyEdit', { field, content })
    },
    [screenProps],
  )

  const verifyEmail = useCallback(() => {
    if (profile.email !== storedProfile.email) {
      verifyEdit('email', profile.email)
    }
  }, [verifyEdit, profile.email, storedProfile.email])

  const verifyPhone = useCallback(async () => {
    if (!storedProfile.mobile) {
      const onlyCheckAlreadyVerified = true
      const res = await API.sendOTP({ mobile }, onlyCheckAlreadyVerified)

      if (!get(res, 'data.alreadyVerified', false)) {
        verifyEdit('phone', mobile)
      }
    } else if (mobile !== storedProfile.mobile) {
      verifyEdit('phone', mobile)
    }
  }, [verifyEdit, mobile, storedProfile.mobile])

  // username handlers
  const onUserNameChange = useCallback(username => onChange(profile.update({ username })), [onChange, profile])

  // phone handlers
  const onPhoneInputFocus = useCallback(() => setLockSubmit(true), [setLockSubmit])
  const onPhoneInputChange = useCallback(value => onChange(profile.update({ mobile: value })), [onChange, profile])
  const onPhoneInputBlur = useCallback(() => {
    const { errors: _errors } = profile.validate()
    const isValid = !_errors.mobile

    setLockSubmit(!isValid)

    if (isValid && mobile) {
      verifyPhone()
    }
  }, [setLockSubmit, verifyPhone, errors, onChange, profile])
  const phoneInputStyles = useMemo(() => StyleSheet.flatten(styles.phoneInput), [styles.phoneInput])

  // email handlers
  const onEmailFocus = useCallback(() => setLockSubmit(true), [setLockSubmit])
  const onEmailChange = useCallback(email => onChange(profile.update({ email })), [onChange, profile])
  const onEmailBlur = useCallback(() => {
    const { errors: _errors } = profile.validate()

    if (!_errors.email) {
      setLockSubmit(false)
      verifyEmail()
    }
  }, [setLockSubmit, verifyEmail, errors])

  const flagImage = useMemo(() => {
    if (!countryFlagUrl || !showCustomFlag) {
      return null
    }

    if (countryFlagUrl.endsWith('.svg') && isMobileNative) {
      return <Svg uri={countryFlagUrl} width={24} height={24} />
    }

    return <Image source={{ uri: countryFlagUrl }} style={styles.flag} />
  }, [countryFlagUrl, showCustomFlag])

  return (
    <Section.Row alignItems="center" grow={1}>
      <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
        <Section.Row>
          <InputRounded
            disabled={!editable}
            error={errors.username}
            icon="username"
            iconColor={theme.colors.primary}
            iconSize={22}
            onChange={onUserNameChange}
            placeholder={t`Choose a Username`}
            value={profile.username}
          />
        </Section.Row>
        <Section.Row>
          {editable ? (
            <Section.Stack grow>
              <Section.Row>
                <PhoneInput
                  error={!!errors.mobile}
                  id="signup_phone"
                  onFocus={onPhoneInputFocus}
                  onChange={onPhoneInputChange}
                  onBlur={onPhoneInputBlur}
                  placeholder="Enter phone number"
                  value={mobile}
                  style={phoneInputStyles}
                  textStyle={{ color: errors.mobile && theme.colors.red }}
                />
                <Section.Row style={styles.suffixIcon}>
                  <Icon
                    color={errors.mobile ? theme.colors.red : theme.colors.primary}
                    name="phone"
                    size={28}
                    style={styles.phoneIcon}
                  />
                </Section.Row>
              </Section.Row>
              <ErrorText error={errors.mobile} style={styles.errorMargin} />
            </Section.Stack>
          ) : (
            <Fragment>
              {flagImage}
              <InputRounded
                containerStyle={countryFlagUrl && styles.disabledPhoneContainer}
                disabled={true}
                error={errors.mobile}
                icon="phone"
                iconColor={theme.colors.primary}
                iconSize={28}
                placeholder="Add your Mobile"
                value={mobile}
              />
            </Fragment>
          )}
        </Section.Row>
        <Section.Row style={!editable && styles.borderedBottomStyle}>
          <InputRounded
            disabled={!editable}
            error={errors.email}
            icon="envelope"
            iconColor={theme.colors.primary}
            iconSize={20}
            onFocus={onEmailFocus}
            onChange={onEmailChange}
            onBlur={onEmailBlur}
            placeholder="Add your Email"
            value={profile.email}
          />
        </Section.Row>
      </KeyboardAwareScrollView>
    </Section.Row>
  )
}

ProfileDataTable.defaultProps = {
  errors: {},
}

const getStylesFromProps = ({ theme, errors }) => {
  return {
    borderedBottomStyle: {
      borderBottomColor: theme.colors.lightGray,
      borderBottomWidth: 1,
    },
    suffixIcon: {
      alignItems: 'center',
      display: 'flex',
      height: 40,
      justifyContent: 'center',
      position: 'absolute',
      right: 1,
      width: 32,
      zIndex: 1,
    },
    errorMargin: {
      marginTop: theme.sizes.default,
      marginBottom: theme.sizes.default,
    },
    phoneIcon: {
      paddingTop: Platform.select({
        web: 0,
        default: 5,
      }),
    },
    phoneInput: {
      borderColor: errors && (errors.mobile ? theme.colors.red : theme.colors.lightGray),
      borderRadius: 24,
      borderWidth: 1,
      color: errors && (errors.mobile ? theme.colors.red : theme.colors.text),
      padding: 10,
      position: 'relative',
      marginVertical: 4,
    },
    flag: {
      height: 24,
      width: 24,
      borderWidth: 1,
      borderColor: theme.colors.lightGray,
      ...Platform.select({
        web: { borderRadius: '50%', borderStyle: 'solid' },
        default: { borderRadius: 24 / 2 },
      }),
    },
    disabledPhoneContainer: {
      paddingLeft: 10,
    },
  }
}

export default withStyles(getStylesFromProps)(ProfileDataTable)
