import React, { Fragment, useCallback } from 'react'
import { Image, Platform } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { noop } from 'lodash'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import useCountryFlagUrl from '../../lib/hooks/useCountryFlagUrl'
import Icon from '../common/view/Icon'
import InputRounded from '../common/form/InputRounded'
import ErrorText from '../common/form/ErrorText'
import Section from '../common/layout/Section'
import { withStyles } from '../../lib/styles'
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
  navigation,
  setLockSubmit = noop,
  showCustomFlag,
}) => {
  const phoneMeta = showCustomFlag && profile.mobile && parsePhoneNumberFromString(profile.mobile)
  const countryFlagUrl = useCountryFlagUrl(phoneMeta && phoneMeta.country)
  const verifyEdit = useCallback(
    (field, content) => {
      navigation.navigate('VerifyEdit', { field, content })
    },
    [navigation]
  )

  const verifyEmail = useCallback(() => {
    if (profile.email !== storedProfile.email) {
      verifyEdit('email', profile.email)
    }
  }, [verifyEdit, profile.email, storedProfile.email])

  const verifyPhone = useCallback(() => {
    if (profile.mobile !== storedProfile.mobile) {
      verifyEdit('phone', profile.mobile)
    }
  }, [verifyEdit, profile.mobile, storedProfile.mobile])

  // username handlers
  const onUserNameChange = useCallback(username => onChange({ ...profile, username }), [onChange, profile])

  // phone handlers
  const onPhoneInputFocus = useCallback(() => setLockSubmit(true), [setLockSubmit])
  const onPhoneInputChange = useCallback(value => onChange({ ...profile, mobile: value }), [onChange, profile])
  const onPhoneInputBlur = useCallback(() => {
    const { errors: _errors } = profile.validate()

    if (!_errors.mobile) {
      setLockSubmit(false)
      verifyPhone()
    }
  }, [setLockSubmit, verifyPhone, errors])

  // email handlers
  const onEmailFocus = useCallback(() => setLockSubmit(true), [setLockSubmit])
  const onEmailChange = useCallback(email => onChange({ ...profile, email }), [onChange, profile])
  const onEmailBlur = useCallback(() => {
    const { errors: _errors } = profile.validate()

    if (!_errors.email) {
      setLockSubmit(false)
      verifyEmail()
    }
  }, [setLockSubmit, verifyEmail, errors])

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
            placeholder="Choose a Username"
            value={profile.username}
          />
        </Section.Row>
        <Section.Row>
          {editable ? (
            <Section.Stack grow>
              <Section.Row className="edit_profile_phone_input">
                <PhoneInput
                  error={errors.mobile && errors.mobile !== ''}
                  id="signup_phone"
                  onFocus={onPhoneInputFocus}
                  onChange={onPhoneInputChange}
                  onBlur={onPhoneInputBlur}
                  placeholder="Enter phone number"
                  value={profile.mobile}
                  style={styles.phoneInput}
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
              {!!errors.mobile && <ErrorText error={errors.mobile} style={styles.errorMargin} />}
            </Section.Stack>
          ) : (
            <Fragment>
              {showCustomFlag && countryFlagUrl && <Image source={{ uri: countryFlagUrl }} style={styles.flag} />}
              <InputRounded
                containerStyle={countryFlagUrl && styles.disabledPhoneContainer}
                disabled={true}
                error={errors.mobile}
                icon="phone"
                iconColor={theme.colors.primary}
                iconSize={28}
                placeholder="Add your Mobile"
                value={profile.mobile}
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
    },
    flag: {
      height: 24,
      width: 24,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.colors.lightGray,
      borderRadius: '50%',
    },
    disabledPhoneContainer: {
      paddingLeft: 10,
    },
  }
}

export default withStyles(getStylesFromProps)(ProfileDataTable)
