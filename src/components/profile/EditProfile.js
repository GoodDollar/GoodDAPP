import React, { useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { TextInput } from 'react-native-paper'
import { Icon } from 'react-native-elements'
import { Wrapper, Section, CustomButton, UserAvatar } from '../common'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'

const log = logger.child({ from: 'Edit Profile' })

const ProfileInput = props => (
  <TextInput
    {...props}
    style={styles.tableRowInput}
    underlineColor="transparent"
    underlineColorAndroid={'rgba(0,0,0,0)'}
    theme={{
      colors: {
        background: 'transparent'
      }
    }}
  />
)

const EditProfile = props => {
  const store = GDStore.useStore()
  const [profile, setProfile] = useState(store.get('profile'))

  // TODO: save into UserStorage
  const handleSaveButton = () => store.set('profile')(profile)
  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={styles.centered}>
          <UserAvatar profile={profile} />
          <CustomButton mode="outlined" style={styles.saveButton} onPress={handleSaveButton}>
            Save
          </CustomButton>
        </Section.Row>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Icon name="email" color="rgb(85, 85, 85)" />
            <ProfileInput
              value={profile.email}
              onChange={value => setProfile({ ...profile, email: value.target.value })}
            />
          </View>
          <View style={styles.tableRow}>
            <Icon name="phone" color="rgb(85, 85, 85)" />
            <ProfileInput
              value={profile.mobile}
              onChange={value => setProfile({ ...profile, mobile: value.target.value })}
            />
          </View>
        </View>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: '1em',
    paddingRight: '1em'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  table: {
    margin: '3em',
    borderTopStyle: 'solid',
    borderTopColor: '#d2d2d2',
    borderTopWidth: '1px'
  },
  tableRow: {
    paddingBottom: '0.5em',
    paddingTop: '0.5em',
    alignItems: 'baseline',
    flexDirection: 'row',
    borderBottomStyle: 'solid',
    borderBottomColor: '#d2d2d2',
    borderBottomWidth: '1px'
  },
  tableRowInput: {
    flex: 1,
    overflow: 'hidden',
    marginLeft: '0.2em',
    borderBottomWidth: 0,
    justifyContent: 'flex-end',
    direction: 'rtl'
  },
  saveButton: {
    position: 'absolute',
    top: 0,
    right: 0
  }
})

export default EditProfile
