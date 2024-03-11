import React, { Fragment, useCallback, useMemo } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from '@mtourj/react-native-keyboard-aware-scroll-view'
import { get, noop } from 'lodash'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { t } from '@lingui/macro'

import useCountryFlag from '../../lib/hooks/useCountryFlag'
import Icon from '../common/view/Icon'
import InputRounded from '../common/form/InputRounded'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import ErrorText from '../common/form/ErrorText'
import Section from '../common/layout/Section'
import { withStyles } from '../../lib/styles'
import API from '../../lib/API'
import { SvgXml } from '../common'
import PhoneInput from './PhoneNumberInput/PhoneNumberInput'
import VerifyButton from './VerifyButton'

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
  setSaveMode = noop,
  saveMode,
  showCustomFlag,
  editMode = false,
}) => {
  const { mobile } = profile || {}
  const phoneMeta = useMemo(
    () => (showCustomFlag && mobile ? parsePhoneNumberFromString(mobile) : null),
    [showCustomFlag, mobile],
  )
  const { country: countryCode = null } = phoneMeta || {}
  const countryFlag = useCountryFlag(countryCode)

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
  const onUserNameChange = useCallback(
    fullName => {
      onChange(profile.update({ fullName }), 'name')
      setSaveMode(prev => ({ ...prev, name: true }))
    },
    [onChange, profile],
  )

  // phone handlers
  const onPhoneInputChange = useCallback(
    value => {
      onChange(profile.update({ mobile: value }), 'mobile')
      setSaveMode(prev => ({ ...prev, phone: true }))
    },
    [setSaveMode, profile],
  )
  const onVerifyPhone = useCallback(() => {
    const { errors: _errors } = profile.validate()
    const isValid = !_errors.mobile

    if (isValid && mobile) {
      verifyPhone()
    }
  }, [verifyPhone, errors, onChange, profile])
  const phoneInputStyles = useMemo(() => StyleSheet.flatten(styles.phoneInput), [styles.phoneInput])

  // email handlers
  const onEmailChange = useCallback(
    email => {
      onChange(profile.update({ email }), 'email')
      setSaveMode(prev => ({ ...prev, email: true }))
    },
    [setSaveMode, profile],
  )

  const onVerifyEmail = useCallback(() => {
    const { errors: _errors } = profile.validate()

    if (!_errors.email) {
      verifyEmail()
    }
  }, [verifyEmail, errors])

  return (
    <Section.Row alignItems={editMode ? 'flex-start' : 'center'} grow={1}>
      <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
        {editMode && (
          <Section.Row style={[styles.disclaimer, { opacity: 0.8 }]}>
            <Text style={{ fontFamily: 'Roboto', fontSize: 14 }}>
              <Text style={{ fontWeight: 'bold' }}>{t`Note:`} </Text>
              {t`Changing your information here will not change how you log in to your wallet.`}
            </Text>
          </Section.Row>
        )}
        {editMode && (
          <Section.Row>
            <InputRounded
              disabled={!editable}
              error={errors.username}
              icon="username"
              iconColor={theme.colors.primary}
              iconSize={22}
              onChange={onUserNameChange}
              value={profile.fullName}
            />
          </Section.Row>
        )}
        <Section.Row>
          {editable ? (
            <Section.Stack grow>
              <Section.Row style={phoneInputStyles}>
                <PhoneInput
                  error={!!errors.mobile}
                  id="signup_phone"
                  onChange={onPhoneInputChange}
                  placeholder="Enter phone number"
                  value={mobile}
                  textStyle={{ color: errors.mobile && theme.colors.red }}
                />
                {saveMode?.phone ? (
                  <Section.Row styles={styles.customSuffixIcon}>
                    <VerifyButton enabled={true} mode="phone" cb={onVerifyPhone} styles={styles.animatedSaveButton} />
                  </Section.Row>
                ) : (
                  <Section.Row style={styles.suffixIcon}>
                    <Icon
                      color={errors.mobile ? theme.colors.red : theme.colors.primary}
                      name="phone"
                      size={28}
                      style={styles.phoneIcon}
                    />
                  </Section.Row>
                )}
              </Section.Row>
              <ErrorText error={errors.mobile} style={styles.errorMargin} />
            </Section.Stack>
          ) : (
            <Fragment>
              {countryFlag && (
                <View style={styles.flagContainer}>
                  <SvgXml src={countryFlag} width={30} height={30} />
                </View>
              )}
              <InputRounded
                containerStyle={countryCode && styles.disabledPhoneContainer}
                disabled={true}
                error={errors.mobile}
                icon="phone"
                iconColor={theme.colors.primary}
                iconSize={28}
                placeholder="Add your Mobile"
                value={mobile ?? ''}
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
            onChange={onEmailChange}
            placeholder="Add your Email"
            value={profile.email ?? ''}
            customIcon={
              <VerifyButton
                enabled={saveMode?.email}
                mode="email"
                cb={onVerifyEmail}
                styles={styles.animatedSaveButton}
              />
            }
          />
        </Section.Row>
      </KeyboardAwareScrollView>
    </Section.Row>
  )
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
      position: 'relative',
      marginVertical: 4,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 6,
      paddingBottom: 6,
    },
    flagContainer: {
      display: 'flex',
      height: 24,
      width: 24,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.lightGray,
      ...Platform.select({
        web: { borderRadius: '50%', borderStyle: 'solid' },
        default: { borderRadius: 24 / 2, paddingTop: 5 },
      }),
    },
    disabledPhoneContainer: {
      paddingLeft: 10,
    },
    disclaimer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingTop: 40,
      paddingBottom: 40,
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingLeft: 8,
      paddingRight: 8,
    },
    animatedSaveButton: {
      position: 'absolute',
      width: getDesignRelativeWidth(110),
      height: 50,
      top: getDesignRelativeHeight(18),
      right: -10,
      marginVertical: 0,
      display: 'flex',
      justifyContent: 'flex-end',
    },
    customSuffixIcon: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      width: 50,
      zIndex: 1,
    },
  }
}

export default withStyles(getStylesFromProps)(ProfileDataTable)
