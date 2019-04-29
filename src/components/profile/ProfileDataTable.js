import React from 'react'
import { StyleSheet, View } from 'react-native'
import { HelperText } from 'react-native-paper'
import { Icon } from 'react-native-elements'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInput.css'

const ProfileInput = props => (
  <View style={styles.inputWrapper}>
    <input {...props} className="react-phone-number-input__input" />
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
        <Icon name="email" color="rgb(85, 85, 85)" />
        <ProfileInput
          value={profile.email}
          onChange={value => onChange({ ...profile, email: value.target.value })}
          error={errors.email}
          disabled={!editable}
        />
      </View>
      <View style={styles.tableRow}>
        <Icon name="phone" color="rgb(85, 85, 85)" />
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
  error: {
    paddingRight: 0,
    textAlign: 'right'
  }
})

export default ProfileDataTable
