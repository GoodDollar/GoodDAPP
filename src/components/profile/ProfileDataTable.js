import React from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from 'react-native-elements/src/icons/Icon'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { HelperText } from 'react-native-paper'
import PhoneInput from 'react-phone-number-input'
import './ProfileDataTablePhoneInput.css'
import { InputRounded, Section } from '../common'
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
            icon="person-outline"
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
                  style={{ borderColor: errors.mobile ? theme.colors.red : theme.colors.gray50Percent }}
                />
                <Icon
                  name="phone"
                  size={normalize(16)}
                  color={theme.colors.primary}
                  containerStyle={styles.phoneIcon}
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
            icon="mail-outline"
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
      paddingTop: theme.paddings.mainContainerPadding
    },
    phoneIcon: {
      position: 'absolute',
      right: normalize(24)
    }
  }
}

export default withStyles(getStylesFromProps)(ProfileDataTable)
