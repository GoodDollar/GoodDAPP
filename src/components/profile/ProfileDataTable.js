import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from 'react-native-elements/src/icons/Icon'

import PhoneInput from 'react-phone-number-input'
import './ProfileDataTablePhoneInput.css'
import { getScreenWidth } from '../../lib/utils/Orientation'

import logger from '../../lib/logger/pino-logger'
import { InputRounded, Section } from '../common'
import './PhoneInput.css'

logger.info('width', { width: getScreenWidth() })

const ProfileDataTable = props => {
  const { profile, onChange, errors: errorsProp, editable } = props
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
          />
        </Section.Row>
      </KeyboardAwareScrollView>
    </Section.Stack>
  )
}

export default ProfileDataTable
