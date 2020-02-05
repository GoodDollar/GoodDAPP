import React from 'react'
import { Platform } from 'react-native'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from '../common/view/Icon'
import InputRounded from '../common/form/InputRounded'
import ErrorText from '../common/form/ErrorText'
import Section from '../common/layout/Section'
import { withStyles } from '../../lib/styles'
import EditPhoneInput from '../common/form/EditPhoneInput/EditPhoneInput'

const ProfileDataTable = ({
  profile,
  storedProfile,
  onChange,
  errors: errorsProp,
  editable,
  theme,
  styles,
  navigation,
  setLockSubmit,
}) => {
  const errors = errorsProp || {}

  const verifyEmail = () => {
    if (profile.email !== storedProfile.email) {
      verifyEdit('email', profile.email)
    }
  }

  const verifyPhone = () => {
    if (profile.mobile !== storedProfile.mobile) {
      verifyEdit('phone', profile.mobile)
    }
  }

  const verifyEdit = (field, content) => {
    navigation.navigate('VerifyEdit', { field, content })
  }

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
            onChange={username => onChange({ ...profile, username })}
            placeholder="Choose a Username"
            value={profile.username}
          />
        </Section.Row>
        <Section.Row>
          {editable ? (
            <Section.Stack grow>
              <Section.Row>
                <EditPhoneInput
                  error={errors.mobile && errors.mobile !== ''}
                  id="signup_phone"
                  onFocus={() => setLockSubmit(true)}
                  onChange={value => onChange({ ...profile, mobile: value })}
                  onBlur={() => {
                    setLockSubmit(false)
                    verifyPhone()
                  }}
                  placeholder="Enter phone number"
                  value={profile.mobile}
                  style={styles.phoneInput}
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
            <InputRounded
              disabled={true}
              error={errors.mobile}
              icon="phone"
              iconColor={theme.colors.primary}
              iconSize={28}
              placeholder="Add your Mobile"
              value={profile.mobile}
            />
          )}
        </Section.Row>
        <Section.Row style={!editable && styles.borderedBottomStyle}>
          <InputRounded
            disabled={!editable}
            error={errors.email}
            icon="envelope"
            iconColor={theme.colors.primary}
            iconSize={20}
            onFocus={() => setLockSubmit(true)}
            onChange={email => onChange({ ...profile, email })}
            onBlur={() => {
              setLockSubmit(false)
              verifyEmail()
            }}
            placeholder="Add your Email"
            value={profile.email}
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
      height: 38,
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      top: 0,
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
  }
}

export default withStyles(getStylesFromProps)(ProfileDataTable)
