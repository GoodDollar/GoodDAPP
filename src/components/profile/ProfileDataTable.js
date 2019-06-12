import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { HelperText } from 'react-native-paper'
import Icon from 'react-native-elements/src/icons/Icon'

import PhoneInput from 'react-phone-number-input'
import './ProfileDataTablePhoneInput.css'
import { getScreenWidth } from '../../lib/utils/Orientation'

import logger from '../../lib/logger/pino-logger'
import './PhoneInput.css'

logger.info('width', { width: getScreenWidth() })
const ProfileInput = props => (
  <View style={styles.inputWrapper}>
    <TextInput {...props} style={styles.textInput} />
    <HelperText type="error" visible={props.error} style={styles.error}>
      {props.error}
    </HelperText>
  </View>
)

const ProfileDataTable = props => {
  const { profile, onChange, errors: errorsProp, editable } = props
  const errors = errorsProp || {}
  return (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <ProfileInput
          placeholder="Choose a Username"
          value={profile.username}
          onChange={value => onChange({ ...profile, username: value.target.value })}
          error={errors.username}
          disabled={!editable}
        />
        <Icon name="person-outline" color="rgb(163, 163, 163)" />
      </View>
      <View style={styles.tableRow}>
        {editable ? (
          <PhoneInput
            id="signup_phone"
            placeholder="Enter phone number"
            value={profile.mobile}
            onChange={value => onChange({ ...profile, mobile: value })}
            error={errors.mobile}
          />
        ) : (
          <ProfileInput value={profile.mobile} disabled={true} />
        )}
        <Icon name="phone" color="rgb(163, 163, 163)" />
      </View>
      <View style={styles.tableRow}>
        <ProfileInput
          value={profile.email}
          onChange={value => onChange({ ...profile, email: value.target.value })}
          error={errors.email}
          disabled={!editable}
        />
        <Icon name="mail-outline" color="rgb(163, 163, 163)" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  table: {
    margin: normalize(getScreenWidth() > 350 ? 20 : 5),
    marginTop: normalize(20),
    borderTopStyle: 'solid',
    borderTopColor: '#d2d2d2',
    borderTopWidth: StyleSheet.hairlineWidth
  },
  tableRow: {
    paddingBottom: normalize(5),
    paddingTop: normalize(5),
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomStyle: 'solid',
    borderBottomColor: '#d2d2d2',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  tableRowInput: {
    flex: 1,
    overflow: 'hidden',
    borderBottomWidth: 0
  },
  inputWrapper: {
    flex: 1,
    marginLeft: normalize(1),
    paddingRight: normalize(5)
  },
  textInput: {
    height: normalize(30),
    backgroundColor: 'rgba(0,0,0,0)',
    borderWidth: 0,
    fontSize: normalize(16),
    textAlign: 'left',
    color: '#555555',
    outline: 'none'
  },
  error: {
    paddingRight: 0,
    textAlign: 'left'
  }
})

export default ProfileDataTable
