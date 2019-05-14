import React from 'react'
import { StyleSheet, View } from 'react-native'
import { FormInput, Icon } from 'react-native-elements'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { HelperText } from 'react-native-paper'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

import logger from '../../lib/logger/pino-logger'
import './PhoneInput.css'

const ProfileInput = props => (
  <View style={styles.inputWrapper}>
    <FormInput {...props} inputStyle={styles.textInput} placeholderTextColor="rgba(85, 85, 85, 0.3)" />
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
          placeholder="choose a Username"
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
    margin: '3em',
    marginTop: '5em',
    borderTopStyle: 'solid',
    borderTopColor: '#d2d2d2',
    borderTopWidth: '1px'
  },
  tableRow: {
    paddingBottom: '0.5em',
    paddingTop: '0.5em',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomStyle: 'solid',
    borderBottomColor: '#d2d2d2',
    borderBottomWidth: '1px'
  },
  tableRowInput: {
    flex: 1,
    overflow: 'hidden',
    borderBottomWidth: 0
  },
  inputWrapper: {
    flex: 1,
    marginLeft: '0.2em',
    paddingRight: '12px'
  },
  textInput: {
    height: '30px',
    backgroundColor: 'transparent',
    borderWidth: '0px',
    fontSize: normalize(16),
    textAlign: 'left',
    color: '#555555'
  },
  error: {
    paddingRight: 0,
    textAlign: 'left'
  }
})

export default ProfileDataTable
