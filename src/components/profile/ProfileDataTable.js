import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PhoneInput from 'react-phone-number-input'
import './ProfileDataTablePhoneInput.css'
import Icon from '../common/view/Icon'
import InputRounded from '../common/form/InputRounded'
import ErrorText from '../common/form/ErrorText'
import Section from '../common/layout/Section'
import { withStyles } from '../../lib/styles'
import './PhoneInput.css'

const ProfileDataTable = ({ profile, onChange, errors: errorsProp, editable, theme, styles }) => {
  const errors = errorsProp || {}
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
                <PhoneInput
                  error={errors.mobile && errors.mobile !== ''}
                  id="signup_phone"
                  onChange={value => onChange({ ...profile, mobile: value })}
                  placeholder="Enter phone number"
                  value={profile.mobile}
                  style={{
                    borderColor: errors.mobile ? theme.colors.red : theme.colors.lightGray,
                    borderRadius: 24,
                    borderWidth: 1,
                    color: errors.mobile ? theme.colors.red : theme.colors.text,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    position: 'relative',
                  }}
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
            onChange={email => onChange({ ...profile, email })}
            placeholder="Add your Email"
            value={profile.email}
          />
        </Section.Row>
      </KeyboardAwareScrollView>
    </Section.Row>
  )
}

const getStylesFromProps = ({ theme }) => {
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
  }
}

export default withStyles(getStylesFromProps)(ProfileDataTable)
