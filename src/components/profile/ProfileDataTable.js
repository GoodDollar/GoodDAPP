import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { withTheme } from 'react-native-paper'
import Icon from 'react-native-elements/src/icons/Icon'
import PhoneInput from 'react-phone-number-input'
import './ProfileDataTablePhoneInput.css'
import { InputRounded, Section } from '../common'
import './PhoneInput.css'

const ProfileDataTable = ({ profile, onChange, errors: errorsProp, editable, theme }) => {
  const errors = errorsProp || {}
  return (
    <Section.Stack justifyContent="flex-end" style={{ marginTop: 'auto' }}>
      <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
        <Section.Row>
          <InputRounded
            onChange={value => onChange({ ...profile, email: value.target.value })}
            placeholder="Choose a Username"
            value={profile.username}
            error={errors.username}
            disabled={!editable}
            icon="person-outline"
            iconColor={theme.colors.primary}
          />
        </Section.Row>
        <Section.Row>
          {editable ? (
            <>
              <PhoneInput
                id="signup_phone"
                placeholder="Enter phone number"
                value={profile.mobile}
                onChange={value => onChange({ ...profile, mobile: value })}
                error={errors.mobile}
              />
              <Icon name="phone" color="rgb(163, 163, 163)" />
            </>
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
            onChange={value => onChange({ ...profile, email: value.target.value })}
            placeholder="Add your Email"
            value={profile.email}
            error={errors.email}
            disabled={!editable}
            icon="mail-outline"
            iconColor={theme.colors.primary}
          />
        </Section.Row>
      </KeyboardAwareScrollView>
    </Section.Stack>
  )
}

export default withTheme(ProfileDataTable)
