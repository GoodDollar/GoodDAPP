import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { HelperText } from 'react-native-paper'
import PhoneInput from 'react-phone-number-input'
import './ProfileDataTablePhoneInput.css'
import { Icon, InputRounded, Section } from '../common'
import { withStyles } from '../../lib/styles'
import './PhoneInput.css'

const ProfileDataTable = ({ profile, onChange, errors: errorsProp, editable, theme, styles }) => {
  const errors = errorsProp || {}
  return (
    <Section.Row alignItems="center" grow={1}>
      <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
        <Section.Row style={!editable && styles.borderedTopStyle}>
          <InputRounded
            onChange={username => onChange({ ...profile, username })}
            placeholder="Choose a Username"
            value={profile.username}
            error={errors.username}
            disabled={!editable}
            icon="privacy"
            iconColor={theme.colors.primary}
          />
        </Section.Row>
        <Section.Row>
          {editable ? (
            <Section.Stack grow>
              <Section.Row grow>
                <PhoneInput
                  id="signup_phone"
                  placeholder="Enter phone number"
                  value={profile.mobile}
                  onChange={value => onChange({ ...profile, mobile: value })}
                  error={errors.mobile}
                  style={{
                    borderColor: errors.mobile ? theme.colors.red : theme.colors.gray50Percent,
                    color: errors.mobile ? theme.colors.red : theme.colors.text,
                  }}
                />
                <Icon
                  name="phone"
                  size={normalize(18)}
                  color={errors.mobile ? theme.colors.red : theme.colors.primary}
                  style={styles.phoneIcon}
                />
              </Section.Row>
              <Section.Row grow>
                <HelperText type="error" visible={errors.mobile} style={styles.error}>
                  {errors.mobile}
                </HelperText>
              </Section.Row>
            </Section.Stack>
          ) : (
            <InputRounded
              placeholder="Add your Mobile"
              value={profile.mobile}
              error={errors.mobile}
              disabled={true}
              icon="phone"
              iconColor={theme.colors.primary}
            />
          )}
        </Section.Row>
        <Section.Row>
          <InputRounded
            onChange={email => onChange({ ...profile, email })}
            placeholder="Add your Email"
            value={profile.email}
            error={errors.email}
            disabled={!editable}
            icon="envelope"
            iconColor={theme.colors.primary}
          />
        </Section.Row>
      </KeyboardAwareScrollView>
    </Section.Row>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    borderedTopStyle: {
      borderTopColor: theme.colors.gray50Percent,
      borderTopWidth: 1,
      paddingTop: theme.paddings.mainContainerPadding,
    },
    phoneIcon: {
      position: 'absolute',
      right: normalize(26),
    },
  }
}

export default withStyles(getStylesFromProps)(ProfileDataTable)
